const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../../frontend/public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = req.query.folder === 'Publicidad' ? 'Publicidad' : 'uploads';
        const targetDir = path.join(__dirname, `../../frontend/public/${folder}`);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname - timestamp - random . extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        console.log('Upload request received:', req.file);
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }
        
        // Return the public URL path
        const folder = req.query.folder === 'Publicidad' ? 'Publicidad' : 'uploads';
        const fileUrl = `/${folder}/${req.file.filename}`;
        console.log('Saved file at:', req.file.path, 'URL:', fileUrl);
        res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error interno del servidor al subir archivo' });
    }
});

// GET /api/upload/images
router.get('/images', (req, res) => {
    try {
        const folder = req.query.folder === 'Publicidad' ? 'Publicidad' : 'uploads';
        const targetDir = path.join(__dirname, `../../frontend/public/${folder}`);
        if (!fs.existsSync(targetDir)) {
            return res.json([]);
        }
        const files = fs.readdirSync(targetDir);
        // Filter out non-images just in case
        const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp|jfif|avif)$/i.test(f));
        const urls = images.map(img => `/${folder}/${img}`);
        res.json(urls);
    } catch (error) {
        console.error('Error reading uploads directory:', error);
        res.status(500).json({ message: 'Error al obtener imágenes' });
    }
});

// GET /api/upload/check-usage
router.get('/check-usage', async (req, res) => {
    try {
        const { filename } = req.query;
        if (!filename) {
            return res.status(400).json({ message: 'Filename required' });
        }

        // The db stores paths like '/uploads/filename.jpg'
        const searchPath = filename.startsWith('/uploads/') ? filename : `/uploads/${filename.replace(/^\//, '')}`;
        const searchLike = `%${searchPath}%`;

        const usages = [];

        // 1. categorias
        const [cats] = await db.query('SELECT nombre FROM categorias WHERE imagen_url = ?', [searchPath]);
        cats.forEach(c => usages.push(`Categoría: ${c.nombre}`));

        // 2. productos (imagen_base)
        const [prods] = await db.query('SELECT nombre FROM productos WHERE imagen_base = ?', [searchPath]);
        prods.forEach(p => usages.push(`Producto (Portada): ${p.nombre}`));

        // 3. productos (galeria JSON)
        const [prodGal] = await db.query('SELECT nombre FROM productos WHERE galeria LIKE ?', [searchLike]);
        prodGal.forEach(p => usages.push(`Producto (Galería): ${p.nombre}`));

        // 4. variantes_producto (imagen_variante)
        const [vars] = await db.query('SELECT p.nombre, v.acabado_color FROM variantes_producto v JOIN productos p ON v.producto_id = p.id WHERE v.imagen_variante = ?', [searchPath]);
        vars.forEach(v => usages.push(`Variante: ${v.nombre} - ${v.acabado_color}`));

        // 4b. variantes_producto (galeria JSON)
        const [varsGal] = await db.query('SELECT p.nombre, v.acabado_color FROM variantes_producto v JOIN productos p ON v.producto_id = p.id WHERE v.galeria LIKE ?', [searchLike]);
        varsGal.forEach(v => usages.push(`Variante (Galería): ${v.nombre} - ${v.acabado_color}`));

        // 5. configuracion_portada
        const [portada] = await db.query('SELECT slot_index, c.nombre as cat_name FROM configuracion_portada cp LEFT JOIN categorias c ON cp.categoria_id = c.id WHERE cp.imagen_url = ?', [searchPath]);
        portada.forEach(p => usages.push(`Diseño Inicio (Slot ${p.slot_index} - ${p.cat_name || 'Sin categoría'})`));

        res.json({ inUse: usages.length > 0, usages });
    } catch (error) {
        console.error('Error checking image usage:', error);
        res.status(500).json({ message: 'Error interno al comprobar uso de la imagen' });
    }
});

// DELETE /api/upload/image
router.delete('/image', async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ message: 'Nombre de archivo requerido' });
        }
        
        const folder = req.query.folder === 'Publicidad' ? 'Publicidad' : 'uploads';
        const targetDir = path.join(__dirname, `../../frontend/public/${folder}`);
        // Extract just the filename if a full URL was passed
        const name = filename.split('/').pop();
        const filePath = path.join(targetDir, name);
        const searchPath = `/${folder}/${name}`;
        
        // Cleanup references in database
        try {
            await db.query('UPDATE categorias SET imagen_url = NULL WHERE imagen_url = ?', [searchPath]);
            await db.query('UPDATE productos SET imagen_base = NULL WHERE imagen_base = ?', [searchPath]);
            await db.query('UPDATE variantes_producto SET imagen_variante = NULL WHERE imagen_variante = ?', [searchPath]);
            await db.query('UPDATE configuracion_portada SET imagen_url = NULL WHERE imagen_url = ?', [searchPath]);
            
            // Clean up galeria JSON array in productos
            const searchLike = `%${searchPath}%`;
            const [prodGal] = await db.query('SELECT id, galeria FROM productos WHERE galeria LIKE ?', [searchLike]);
            for (let p of prodGal) {
                try {
                    const galArray = typeof p.galeria === 'string' ? JSON.parse(p.galeria) : (p.galeria || []);
                    const newGalArray = galArray.filter(url => url !== searchPath);
                    await db.query('UPDATE productos SET galeria = ? WHERE id = ?', [JSON.stringify(newGalArray), p.id]);
                } catch(e) {
                    console.error('Error parsing gallery JSON for cleanup', e);
                }
            }

            // Clean up galeria JSON array in variantes_producto
            const [varGal] = await db.query('SELECT id, galeria FROM variantes_producto WHERE galeria LIKE ?', [searchLike]);
            for (let v of varGal) {
                try {
                    const galArray = typeof v.galeria === 'string' ? JSON.parse(v.galeria) : (v.galeria || []);
                    const newGalArray = galArray.filter(url => url !== searchPath);
                    await db.query('UPDATE variantes_producto SET galeria = ? WHERE id = ?', [JSON.stringify(newGalArray), v.id]);
                } catch(e) {
                    console.error('Error parsing variant gallery JSON for cleanup', e);
                }
            }
            
            // Delete actual file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            res.json({ message: 'Imagen eliminada correctamente' });
        } catch (dbError) {
            console.error('Error cleaning up image references:', dbError);
            res.status(500).json({ message: 'Error interno al actualizar base de datos' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error interno al eliminar la imagen' });
    }
});

module.exports = router;
