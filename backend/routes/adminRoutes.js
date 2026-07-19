const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/metrics', verifyToken, isAdmin, adminController.getMetrics);
router.get('/staff', verifyToken, isAdmin, adminController.getStaff);
router.get('/inventory', verifyToken, isAdmin, adminController.getInventory);

// Layout Config
router.get('/layout', verifyToken, isAdmin, adminController.getLayout);
router.put('/layout', verifyToken, isAdmin, adminController.updateLayout);
router.put('/hero', verifyToken, isAdmin, adminController.updateHeroText);

// Contact Config
router.get('/contact', verifyToken, isAdmin, adminController.getContactSettings);
router.put('/contact', verifyToken, isAdmin, adminController.updateContactSettings);

// Product CRUD
router.post('/products', verifyToken, isAdmin, adminController.createProduct);
router.put('/products/:id', verifyToken, isAdmin, adminController.updateProduct);
router.delete('/products/:id', verifyToken, isAdmin, adminController.deleteProduct);

// Variant CRUD
router.post('/variants', verifyToken, isAdmin, adminController.createVariant);
router.put('/variants/:id', verifyToken, isAdmin, adminController.updateVariant);
router.delete('/variants/:id', verifyToken, isAdmin, adminController.deleteVariant);
// Category CRUD
router.post('/categories', verifyToken, isAdmin, adminController.createCategory);
router.put('/categories/:id', verifyToken, isAdmin, adminController.updateCategory);
router.delete('/categories/:id', verifyToken, isAdmin, adminController.deleteCategory);

module.exports = router;
