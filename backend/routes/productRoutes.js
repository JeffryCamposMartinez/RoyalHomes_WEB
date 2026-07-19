const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/categories', productController.getAllCategories);
router.get('/layout', productController.getStoreLayout);
router.get('/contact', productController.getContactSettings);
router.get('/hero', productController.getHeroText);
router.get('/check-sku', productController.checkSku);

module.exports = router;
