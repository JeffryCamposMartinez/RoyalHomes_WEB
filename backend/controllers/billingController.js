const billingDb = require('../config/billingDb');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

exports.createPreference = async (req, res) => {
  const { invoiceIds } = req.body;
  const ids = Array.isArray(invoiceIds) ? invoiceIds : [req.body.invoiceId];

  try {
     if (!ids || ids.length === 0) return res.status(400).json({error: 'No se enviaron facturas'});
     const [invoices] = await billingDb.query('SELECT * FROM invoices WHERE id IN (?)', [ids]);
     if (invoices.length === 0) return res.status(404).json({error: 'Facturas no encontradas'});

     const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
     const description = invoices.length > 1 ? `Pago de ${invoices.length} facturas de Hosting` : `Mensualidad de Hosting`;

     const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
     const preference = new Preference(client);

     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
     const backendUrl = process.env.PUBLIC_BACKEND_URL || "http://localhost:3001";

     const body = {
         items: [
             {
                 id: ids.join(','),
                 title: description,
                 quantity: 1,
                 unit_price: totalAmount,
                 currency_id: 'CLP',
             }
         ],
         back_urls: {
             success: `${frontendUrl}/admin?payment=success`,
             failure: `${frontendUrl}/admin?payment=failure`,
             pending: `${frontendUrl}/admin?payment=pending`
         },
         auto_return: 'approved',
         notification_url: `${backendUrl}/api/billing/webhook/mercadopago`
     };

     const result = await preference.create({ body });
     res.json({ id: result.id, init_point: result.init_point });
  } catch (err) {
     console.error('Error creating MP preference:', err);
     res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
};

exports.receiveWebhook = async (req, res) => {
  res.sendStatus(200);

  const paymentId = req.query.id || req.body?.data?.id;
  const topic = req.query.topic || req.body?.type;

  if (topic === 'payment' && paymentId) {
    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      if (paymentData.status === 'approved') {
        const invoiceIdsStr = paymentData.additional_info?.items?.[0]?.id;
        if (invoiceIdsStr) {
          const invoiceIds = invoiceIdsStr.split(',').map(id => parseInt(id));
          const totalAmount = paymentData.transaction_amount;
          
          for (const invId of invoiceIds) {
            await billingDb.query('UPDATE invoices SET status = "paid" WHERE id = ?', [invId]);
            
            const [existing] = await billingDb.query('SELECT id FROM payments WHERE invoice_id = ?', [invId]);
            if (existing.length === 0) {
              await billingDb.query(
                'INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
                [invId, totalAmount / invoiceIds.length, 'Mercado Pago', paymentData.id.toString(), 'completed']
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Error procesando webhook MP', err);
    }
  }
};
exports.getBillingDashboard = async (req, res) => {
  try {
    // Por ahora usamos el dominio de la tienda hardcodeado o sacado del frontend
    // En un SaaS multi-tenant se sacaría del middleware de autenticación
    const storeDomain = 'royalhomes.cl'; 
    
    // 1. Obtener cliente
    const [clients] = await billingDb.query('SELECT * FROM clients WHERE store_domain = ?', [storeDomain]);
    if (clients.length === 0) {
        return res.json({ client: null, subscription: null, invoices: [], payments: [] });
    }
    const client = clients[0];

    // 2. Obtener suscripción
    const [subscriptions] = await billingDb.query('SELECT * FROM subscriptions WHERE client_id = ?', [client.id]);
    const subscription = subscriptions[0] || null;

    // 3. Obtener facturas
    const [invoices] = await billingDb.query('SELECT * FROM invoices WHERE client_id = ? ORDER BY due_date DESC', [client.id]);
    
    // 4. Obtener pagos
    let payments = [];
    if (invoices.length > 0) {
        const invoiceIds = invoices.map(i => i.id);
        const [paymentRows] = await billingDb.query('SELECT * FROM payments WHERE invoice_id IN (?) ORDER BY payment_date DESC', [invoiceIds]);
        payments = paymentRows;
    }

    res.json({ client, subscription, invoices, payments });
  } catch (err) {
    console.error('Error fetching billing data:', err);
    res.status(500).json({ error: 'Error fetching billing data' });
  }
};

exports.reportTransfer = async (req, res) => {
  const { invoiceIds, transactionId } = req.body;
  // Soportar también invoiceId (legacy)
  const ids = Array.isArray(invoiceIds) ? invoiceIds : [req.body.invoiceId];

  try {
     if (!ids || ids.length === 0) return res.status(400).json({error: 'No se enviaron facturas'});

     const [invoices] = await billingDb.query('SELECT * FROM invoices WHERE id IN (?)', [ids]);
     if (invoices.length === 0) return res.status(404).json({error: 'Facturas no encontradas'});
     
     // Registrar el pago como pendiente de aprobación para CADA factura seleccionada
     for(const invoice of invoices) {
       await billingDb.query(
           'INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
           [invoice.id, invoice.amount, 'transferencia', transactionId, 'pending']
       );
     }
     
     res.json({ success: true, message: 'Pagos reportados con éxito.' });
  } catch(err) {
     console.error('Error reporting transfer:', err);
     res.status(500).json({ error: 'Error interno al reportar el pago' });
  }
};

// --- ENDPOINTS PARA EL ADMIN C++ ---
exports.getAllClients = async (req, res) => {
  try {
    const [clients] = await billingDb.query('SELECT * FROM clients');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const [invoices] = await billingDb.query('SELECT * FROM invoices');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
