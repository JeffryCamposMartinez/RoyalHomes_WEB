const db = require('../config/db');

const getFullUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.PUBLIC_BACKEND_URL || 'http://nk7qrdyo4oxvieqdl35lgi42.185.173.110.158.sslip.io';
  return `${baseUrl}${url}`;
};

const formatGallery = (galleryStr) => {
  if (!galleryStr) return [];
  try {
    const arr = typeof galleryStr === 'string' ? JSON.parse(galleryStr) : galleryStr;
    return Array.isArray(arr) ? arr.map(getFullUrl) : [];
  } catch (e) {
    return [];
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre as name, descripcion, imagen_url FROM categorias');
    res.json(rows.map(c => ({
      ...c,
      imagen_url: getFullUrl(c.imagen_url)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error getting categories' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const categoryId = req.query.category;
    let query = `
      SELECT p.id, p.nombre as name, p.descripcion as description, p.especificaciones as specifications, p.precio_base as price, p.imagen_base as image, p.galeria as gallery, p.activo as inStock, c.nombre as category, c.id as categoryId,
             (SELECT MAX(descuento_porcentaje) FROM configuracion_portada WHERE categoria_id = c.id) as discount_percentage
      FROM productos p 
      JOIN categorias c ON p.categoria_id = c.id
    `;
    const params = [];
    if (categoryId) {
      query += ' WHERE p.categoria_id = ?';
      params.push(categoryId);
    }
    const [rows] = await db.query(query, params);
    
    // Fetch variants for these products
    const [variantes] = await db.query('SELECT * FROM variantes_producto');
    
    const productsWithVariants = rows.map(p => {
      const discount = p.discount_percentage || 0;
      const priceCalc = discount > 0 ? p.price * (1 - discount / 100) : p.price;
      
      return {
        ...p,
        image: getFullUrl(p.image),
        gallery: JSON.stringify(formatGallery(p.gallery)),
        inStock: p.inStock === 1,
        discount_percentage: discount,
        price_calculated: priceCalc,
        variantes: variantes.filter(v => v.producto_id === p.id).map(v => ({
          ...v,
          imagen_variante: getFullUrl(v.imagen_variante),
          galeria: JSON.stringify(formatGallery(v.galeria))
        }))
      };
    });

    res.json(productsWithVariants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting products' });
  }
};

exports.getStoreLayout = async (req, res) => {
  try {
    const [layout] = await db.query(`
      SELECT cp.slot_index, c.id, c.nombre as name, cp.imagen_url as imagen_url, cp.descuento_porcentaje
      FROM configuracion_portada cp
      JOIN categorias c ON cp.categoria_id = c.id
      ORDER BY cp.slot_index ASC
    `);
    res.json(layout.map(l => ({
      ...l,
      imagen_url: getFullUrl(l.imagen_url)
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting store layout' });
  }
};

exports.getContactSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM configuracion_contacto WHERE id = 1');
    if (rows.length === 0) {
      return res.json({});
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener configuracion de contacto' });
  }
};

exports.getHeroText = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT hero_text, footer_text FROM configuracion_tienda WHERE id = 1');
    if (rows.length === 0) {
      return res.json({ hero_text: 'Bienvenido a la tienda', footer_text: 'Bienvenido a la tienda' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener configuracion hero' });
  }
};

exports.checkSku = async (req, res) => {
  const { sku, currentId } = req.query;
  if (!sku) return res.status(400).json({ error: 'SKU is required' });
  try {
    let query = 'SELECT id FROM variantes_producto WHERE sku = ?';
    let params = [sku];
    if (currentId) {
      query += ' AND id != ?';
      params.push(currentId);
    }
    const [rows] = await db.query(query, params);
    res.json({ unique: rows.length === 0 });
  } catch (err) {
    console.error('Check SKU error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
