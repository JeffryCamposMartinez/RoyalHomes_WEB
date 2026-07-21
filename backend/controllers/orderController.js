const db = require('../config/db');

exports.createOrder = async (req, res) => {
  const { shippingInfo, items, total, metodo_entrega, metodo_contacto, whatsapp_contacto } = req.body;
  const userId = req.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Empty order' });
  }

  const direccion_envio = shippingInfo ? `${shippingInfo.direccion || ''}, ${shippingInfo.ciudad || ''}, ${shippingInfo.codigoPostal || ''}` : 'Sin dirección';

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Insert order (estado_id = 1 is Pendiente de Aprobación)
    const [orderResult] = await connection.query(
      'INSERT INTO pedidos (usuario_id, estado_id, direccion_envio, total, metodo_entrega, metodo_contacto, whatsapp_contacto) VALUES (?, 1, ?, ?, ?, ?, ?)',
      [userId, direccion_envio, total, metodo_entrega || 'retiro_fisico', metodo_contacto || 'chat_nativo', whatsapp_contacto || null]
    );
    const orderId = orderResult.insertId;
    
    // Insert items
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalles_pedido (pedido_id, variante_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [orderId, item.variantId, item.quantity, item.price]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Order created as request', orderId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  const userId = req.userId;
  const connection = await db.getConnection();
  try {
    const [orders] = await connection.query(
      `SELECT p.*, e.nombre as estado
       FROM pedidos p
       JOIN estados_pedido e ON p.estado_id = e.id
       WHERE p.usuario_id = ?
       ORDER BY p.creado_en DESC`,
      [userId]
    );

    // Fetch items for each order
    for (let order of orders) {
      const [items] = await connection.query(
        `SELECT d.cantidad, d.precio_unitario, v.sku, v.material, v.acabado_color, prod.nombre, prod.imagen_principal
         FROM detalles_pedido d
         JOIN variantes_producto v ON d.variante_id = v.id
         JOIN productos prod ON v.producto_id = prod.id
         WHERE d.pedido_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  } finally {
    connection.release();
  }
};

exports.getOrderChat = async (req, res) => {
  const { id } = req.params;
  try {
    const [messages] = await db.query(
      `SELECT m.*, u.nombre, u.rol_id 
       FROM mensajes_pedido m 
       JOIN usuarios u ON m.remitente_id = u.id 
       WHERE m.pedido_id = ? 
       ORDER BY m.creado_en ASC`,
      [id]
    );
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
};
