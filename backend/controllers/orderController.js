const db = require('../config/db');

exports.createOrder = async (req, res) => {
  const { shippingInfo, items, total } = req.body;
  const userId = req.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Empty order' });
  }

  const direccion_envio = shippingInfo ? `${shippingInfo.direccion}, ${shippingInfo.ciudad}, ${shippingInfo.codigoPostal}` : 'Sin dirección';

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Insert order (estado_id = 1 is Pendiente)
    const [orderResult] = await connection.query(
      'INSERT INTO pedidos (usuario_id, estado_id, direccion_envio, total) VALUES (?, 1, ?, ?)',
      [userId, direccion_envio, total]
    );
    const orderId = orderResult.insertId;
    
    // Generar un preference_id de prueba para simular Mercado Pago
    const mockPreferenceId = `MP-PREF-MOCK-${Date.now()}-${orderId}`;

    // Actualizar pedido con el preference_id
    await connection.query(
      'UPDATE pedidos SET mercadopago_preference_id = ? WHERE id = ?',
      [mockPreferenceId, orderId]
    );
    
    // Insert items
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalles_pedido (pedido_id, variante_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [orderId, item.variantId, item.quantity, item.price]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Order created', orderId, preferenceId: mockPreferenceId, init_point: 'https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=' + mockPreferenceId });
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
      `SELECT p.id, p.total, p.creado_en, e.nombre as estado, p.direccion_envio
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
