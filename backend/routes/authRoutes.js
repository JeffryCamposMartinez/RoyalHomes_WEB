const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/sync-cart', verifyToken, authController.syncCart);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/addresses', verifyToken, authController.updateAddresses);

module.exports = router;
