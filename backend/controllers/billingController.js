const billingDb = require('../config/billingDb');

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
  const { invoiceId, transactionId } = req.body;
  try {
     const [invoice] = await billingDb.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
     if (invoice.length === 0) return res.status(404).json({error: 'Factura no encontrada'});
     
     // Registrar el pago como pendiente de aprobación
     await billingDb.query(
         'INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
         [invoiceId, invoice[0].amount, 'transferencia', transactionId, 'pending']
     );
     
     res.json({ success: true, message: 'Pago reportado con éxito.' });
  } catch(err) {
     console.error('Error reporting transfer:', err);
     res.status(500).json({ error: 'Error interno al reportar el pago' });
  }
};
