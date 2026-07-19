const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get billing dashboard data (requires admin login to store)
router.get('/', verifyToken, isAdmin, billingController.getBillingDashboard);

// Report manual transfer
router.post('/transfer', verifyToken, isAdmin, billingController.reportTransfer);

module.exports = router;
