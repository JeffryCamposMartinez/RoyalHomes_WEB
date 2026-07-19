const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get billing dashboard data (requires admin login to store)
router.get('/', verifyToken, isAdmin, billingController.getBillingDashboard);

// Report manual transfer
router.post('/transfer', verifyToken, isAdmin, billingController.reportTransfer);

// Create Mercado Pago preference
router.post('/create-preference', verifyToken, isAdmin, billingController.createPreference);

// Mercado Pago Webhook (Public route, no token required)
router.post('/webhook/mercadopago', billingController.receiveWebhook);

// --- RUTAS PARA EL ADMIN C++ ---
// Para simplificar la conexión local con el C++, temporalmente las dejamos sin token. 
// En producción se deben proteger.
router.get('/admin/clients', billingController.getAllClients);
router.get('/admin/invoices', billingController.getAllInvoices);

module.exports = router;
