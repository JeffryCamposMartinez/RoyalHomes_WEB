const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: '185.173.110.158',
    user: 'mysql',
    password: 'Iav9Sd9q6309Udhm9KaiwxcpT7rWYCwXdZyGVy9AmMxl7XPaHoDFpJmdNLJd7jsm',
    database: 'RoyalHomes_db'
};

const folders = [
    path.join(__dirname, '../frontend/public/uploads'),
    path.join(__dirname, '../frontend/public/Publicidad')
];

async function convertFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return;
    
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        if (file.endsWith('.webp')) continue; // Already webp
        
        if (/\.(jpg|jpeg|png|jfif|avif)$/i.test(file)) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const inputPath = path.join(folderPath, file);
            const outputPath = path.join(folderPath, `${baseName}.webp`);
            
            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                console.log(`Converted: ${file} -> ${baseName}.webp`);
                
                // Delete old file
                fs.unlinkSync(inputPath);
            } catch (err) {
                console.error(`Error converting ${file}:`, err);
            }
        }
    }
}

async function updateDatabase() {
    console.log('Conectando a la base de datos para actualizar rutas...');
    const connection = await mysql.createConnection(dbConfig);
    
    const queries = [
        // Productos
        `UPDATE productos SET imagen_base = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_base, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_base IS NOT NULL`,
        `UPDATE productos SET galeria = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(galeria, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE galeria IS NOT NULL`,
        
        // Variantes
        `UPDATE variantes_producto SET imagen_variante = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_variante, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_variante IS NOT NULL`,
        `UPDATE variantes_producto SET galeria = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(galeria, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE galeria IS NOT NULL`,
        
        // Categorias
        `UPDATE categorias SET imagen_url = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_url, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_url IS NOT NULL`,
        
        // Portada
        `UPDATE configuracion_portada SET imagen_url = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_url, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_url IS NOT NULL`
    ];
    
    for (const q of queries) {
        try {
            const [result] = await connection.execute(q);
            console.log(`Updated ${result.affectedRows} rows.`);
        } catch (err) {
            console.error('Error executing query:', err);
        }
    }
    
    await connection.end();
    console.log('Base de datos actualizada correctamente.');
}

async function main() {
    console.log('Iniciando conversión de imágenes a WebP...');
    for (const folder of folders) {
        console.log(`Procesando carpeta: ${folder}`);
        await convertFolder(folder);
    }
    
    await updateDatabase();
    console.log('¡Proceso completo!');
}

main();
