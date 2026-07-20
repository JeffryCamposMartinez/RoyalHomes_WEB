const db = require('../config/db');

const getFullUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.PUBLIC_BACKEND_URL || 'http://nk7qrdyo4oxvieqdl35lgi42.185.173.110.158.sslip.io';
  return `${baseUrl}${url}`;
};

exports.getMetrics = async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await db.query('SELECT SUM(total) as totalRevenue FROM pedidos');
    const [[{ totalOrders }]] = await db.query('SELECT COUNT(id) as totalOrders FROM pedidos');
    const [[{ activeUsers }]] = await db.query('SELECT COUNT(id) as activeUsers FROM usuarios WHERE activo = 1');
    const [[{ lowStock }]] = await db.query('SELECT COUNT(id) as lowStock FROM variantes_producto WHERE stock < 10');

    res.json({
      totalRevenue: totalRevenue || 0,
      totalOrders: totalOrders || 0,
      activeUsers: activeUsers || 0,
      lowStock: lowStock || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting metrics' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const [staff] = await db.query(`
      SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.rol_id = 1
    `);
    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting staff' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(`
      SELECT v.id as variante_id, p.nombre as producto, c.nombre as categoria, 
             v.sku, v.stock, v.precio_especifico, p.precio_base, p.imagen_base
      FROM variantes_producto v
      JOIN productos p ON v.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
    `);
    
    const formattedInventory = inventory.map(item => ({
      ...item,
      imagen_base: getFullUrl(item.imagen_base),
      price: item.precio_especifico || item.precio_base,
      status: item.stock === 0 ? 'Out of Stock' : item.stock < 10 ? 'Low Stock' : 'In Stock'
    }));

    res.json(formattedInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting inventory' });
  }
};

// --- PRODUCT CRUD ---

exports.createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, especificaciones, precio_base, imagen_base, galeria, categoria_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO productos (nombre, descripcion, especificaciones, precio_base, imagen_base, galeria, categoria_id, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [nombre, descripcion, especificaciones || null, precio_base, imagen_base, galeria ? JSON.stringify(galeria) : null, categoria_id]
    );
    
    // Crear variante por defecto para que se pueda vender inmediatamente sin configurar variantes manualmente
    const defaultSku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await db.query(
      'INSERT INTO variantes_producto (producto_id, material, acabado_color, sku, stock, precio_especifico, imagen_variante, galeria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [result.insertId, 'Estándar', 'Único', defaultSku, 1, precio_base, imagen_base || null, galeria ? JSON.stringify(galeria) : null]
    );

    res.status(201).json({ id: result.insertId, message: 'Producto creado con variante por defecto' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, especificaciones, precio_base, imagen_base, galeria, categoria_id } = req.body;
    await db.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, especificaciones = ?, precio_base = ?, imagen_base = ?, galeria = ?, categoria_id = ? WHERE id = ?',
      [nombre, descripcion, especificaciones || null, precio_base, imagen_base, galeria ? JSON.stringify(galeria) : null, categoria_id, id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // The foreign keys in schema should cascade or restrict. If no cascade, we delete variants first.
    await db.query('DELETE FROM variantes_producto WHERE producto_id = ?', [id]);
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto. Asegúrate de que no haya pedidos vinculados.' });
  }
};

// --- VARIANT CRUD ---

exports.createVariant = async (req, res) => {
  try {
    const { producto_id, material, acabado_color, sku, stock, precio_especifico, imagen_variante, galeria, especificaciones } = req.body;
    const [result] = await db.query(
      'INSERT INTO variantes_producto (producto_id, material, acabado_color, sku, stock, precio_especifico, imagen_variante, galeria, especificaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [producto_id, material, acabado_color, sku, stock, precio_especifico, imagen_variante || null, galeria ? JSON.stringify(galeria) : null, especificaciones || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Variante creada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear variante' });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { material, acabado_color, sku, stock, precio_especifico, imagen_variante, galeria, especificaciones } = req.body;
    await db.query(
      'UPDATE variantes_producto SET material = ?, acabado_color = ?, sku = ?, stock = ?, precio_especifico = ?, imagen_variante = ?, galeria = ?, especificaciones = ? WHERE id = ?',
      [material, acabado_color, sku, stock, precio_especifico, imagen_variante || null, galeria ? JSON.stringify(galeria) : null, especificaciones || null, id]
    );
    res.json({ message: 'Variante actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar variante' });
  }
};

exports.deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM variantes_producto WHERE id = ?', [id]);
    res.json({ message: 'Variante eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar variante' });
  }
};

// --- CATEGORY CRUD ---

exports.createCategory = async (req, res) => {
  try {
    const { nombre, descripcion, imagen_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES (?, ?, ?)',
      [nombre, descripcion, imagen_url || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Categoría creada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen_url } = req.body;
    await db.query(
      'UPDATE categorias SET nombre = ?, descripcion = ?, imagen_url = ? WHERE id = ?',
      [nombre, descripcion, imagen_url || null, id]
    );
    res.json({ message: 'Categoría actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if category has products
    const [products] = await db.query('SELECT id FROM productos WHERE categoria_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return res.status(400).json({ message: 'No se puede eliminar la categoría porque tiene productos asignados.' });
    }
    
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};

// --- STORE LAYOUT ---

exports.getLayout = async (req, res) => {
  try {
    const [layout] = await db.query(`
      SELECT cp.slot_index, cp.categoria_id, cp.imagen_url as layout_imagen_url, cp.descuento_porcentaje, c.nombre, c.imagen_url as cat_imagen_url
      FROM configuracion_portada cp
      LEFT JOIN categorias c ON cp.categoria_id = c.id
      ORDER BY cp.slot_index ASC
    `);
    res.json(layout.map(l => ({
      ...l,
      layout_imagen_url: getFullUrl(l.layout_imagen_url),
      cat_imagen_url: getFullUrl(l.cat_imagen_url)
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener configuración de portada' });
  }
};

const fs = require('fs');
const path = require('path');

exports.updateLayout = async (req, res) => {
  try {
    const layoutData = req.body; // Array of { slot_index, categoria_id, imagen_url }
    for (const item of layoutData) {
      await db.query(
        'INSERT INTO configuracion_portada (slot_index, categoria_id, imagen_url, descuento_porcentaje) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE categoria_id = ?, imagen_url = ?, descuento_porcentaje = ?',
        [item.slot_index, item.categoria_id || null, item.imagen_url || null, item.descuento_porcentaje || 0, item.categoria_id || null, item.imagen_url || null, item.descuento_porcentaje || 0]
      );
    }



    res.json({ message: 'Configuración actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar configuración de portada' });
  }
};

exports.updateHeroText = async (req, res) => {
  try {
    const { hero_text, footer_text } = req.body;
    await db.query(
      'INSERT INTO configuracion_tienda (id, hero_text, footer_text) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE hero_text = ?, footer_text = ?',
      [hero_text, footer_text, hero_text, footer_text]
    );
    res.json({ message: 'Texto de bienvenida actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar texto hero' });
  }
};

// --- CONTACT SETTINGS ---
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

exports.updateContactSettings = async (req, res) => {
  try {
    const { instagram_url, facebook_url, whatsapp, email_contacto, telefono, direccion_fisica } = req.body;
    await db.query(
      `INSERT INTO configuracion_contacto (id, instagram_url, facebook_url, whatsapp, email_contacto, telefono, direccion_fisica) 
       VALUES (1, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       instagram_url = VALUES(instagram_url),
       facebook_url = VALUES(facebook_url),
       whatsapp = VALUES(whatsapp),
       email_contacto = VALUES(email_contacto),
       telefono = VALUES(telefono),
       direccion_fisica = VALUES(direccion_fisica)`,
      [instagram_url, facebook_url, whatsapp, email_contacto, telefono, direccion_fisica]
    );
    res.json({ message: 'Configuración de contacto actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar configuración de contacto' });
  }
};
