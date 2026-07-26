const db = require('../config/db');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

exports.createOrder = async (req, res) => {
  const { shippingInfo, items, total, metodo_entrega, metodo_contacto, whatsapp_contacto, direct_payment } = req.body;
  const userId = req.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Empty order' });
  }

  const direccion_envio = shippingInfo ? `${shippingInfo.direccion || ''}, ${shippingInfo.ciudad || ''}, ${shippingInfo.codigoPostal || ''}` : 'Sin dirección';

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Validar stock si es direct_payment
    if (direct_payment) {
      for (const item of items) {
        const [variant] = await connection.query('SELECT stock FROM variantes_producto WHERE id = ? FOR UPDATE', [item.variantId]);
        if (!variant || variant.length === 0 || variant[0].stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto ${item.name}`);
        }
      }
    }

    // Insert order (estado_id = 6 if direct_payment, else 1)
    const initialState = direct_payment ? 6 : 1;
    const [orderResult] = await connection.query(
      'INSERT INTO pedidos (usuario_id, estado_id, direccion_envio, total, metodo_entrega, metodo_contacto, whatsapp_contacto) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, initialState, direccion_envio, total, metodo_entrega || 'retiro_fisico', metodo_contacto || 'chat_nativo', whatsapp_contacto || null]
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
    
    // Notificar a todos los admins
    const [admins] = await connection.query('SELECT id FROM usuarios WHERE rol_id = 1');
    for (const admin of admins) {
      await connection.query(
        'INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)',
        [admin.id, 'nuevo_pedido', `Nueva solicitud de Pedido #${orderId}`, orderId]
      );
      if (req.io) {
        req.io.emit(`nueva_notificacion_${admin.id}`);
      }
    }
    
    // Si es direct_payment, crear preferencia de MercadoPago
    if (direct_payment) {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const preference = new Preference(client);

      const frontendUrl = process.env.FRONTEND_URL || "https://royalhomes.cl";
      const backendUrl = process.env.PUBLIC_BACKEND_URL || "https://api.royalhomes.cl";

      const preferenceItems = items.map(item => ({
        id: item.variantId.toString(),
        title: item.name,
        description: item.variant,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.price),
        currency_id: 'CLP'
      }));

      const body = {
        items: preferenceItems,
        back_urls: {
            success: `${frontendUrl}/profile?tab=compras`,
            failure: `${frontendUrl}/profile?tab=compras`,
            pending: `${frontendUrl}/profile?tab=compras`
        },
        auto_return: 'approved',
        notification_url: `${backendUrl}/api/orders/webhook/mercadopago`,
        external_reference: `ORDER_${orderId}`
      };

      const prefResult = await preference.create({ body });
      
      await connection.query('UPDATE pedidos SET mercadopago_preference_id = ? WHERE id = ?', [prefResult.id, orderId]);
      await connection.commit();
      
      return res.status(201).json({ message: 'Redirecting to payment', orderId, init_point: prefResult.init_point });
    }

    await connection.commit();
    res.status(201).json({ message: 'Order created as request', orderId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error creating order' });
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
        `SELECT d.cantidad, d.precio_unitario, v.sku, v.material, v.acabado_color, prod.nombre, prod.imagen_base as imagen_principal
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

exports.receiveWebhook = async (req, res) => {
  // Siempre retornar 200 inmediatamente a MercadoPago
  res.sendStatus(200);

  const paymentId = req.query.id || req.body?.data?.id;
  const topic = req.query.topic || req.body?.type;

  if (topic === 'payment' && paymentId) {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === 'approved' && paymentData.external_reference && paymentData.external_reference.startsWith('ORDER_')) {
        const orderId = parseInt(paymentData.external_reference.replace('ORDER_', ''));
        
        // Evitar procesar el mismo pago 2 veces si llega duplicado
        const [existingOrders] = await db.query('SELECT id, estado_id FROM pedidos WHERE id = ?', [orderId]);
        if (existingOrders.length === 0) return;
        const order = existingOrders[0];
        
        if (order.estado_id === 2) {
          // Ya estaba pagado
          return;
        }

        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();

          // Marcar como pagado (estado_id = 2) y guardar info de pago
          await connection.query(
            'UPDATE pedidos SET estado_id = 2, payment_id = ?, payment_status = ? WHERE id = ?',
            [paymentId.toString(), 'approved', orderId]
          );

          // Descontar stock
          const [detalles] = await connection.query('SELECT variante_id, cantidad FROM detalles_pedido WHERE pedido_id = ?', [orderId]);
          for (const detalle of detalles) {
            await connection.query(
              'UPDATE variantes_producto SET stock = GREATEST(0, stock - ?) WHERE id = ?',
              [detalle.cantidad, detalle.variante_id]
            );
          }

          // Notificar a admins
          const [admins] = await connection.query('SELECT id FROM usuarios WHERE rol_id = 1');
          for (const admin of admins) {
            await connection.query(
              'INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)',
              [admin.id, 'mensaje', `El pedido #${orderId} ha sido pagado directo.`, orderId]
            );
            if (req.io) {
              req.io.emit(`nueva_notificacion_${admin.id}`);
            }
          }

          await connection.commit();
        } catch (txnErr) {
          await connection.rollback();
          console.error('Error in webhook transaction:', txnErr);
        } finally {
          connection.release();
        }
      }
    } catch (err) {
      console.error('Error procesando webhook MP de orders:', err);
    }
  }
};
