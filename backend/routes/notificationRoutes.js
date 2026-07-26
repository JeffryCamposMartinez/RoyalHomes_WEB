const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/mark-all-read', verifyToken, notificationController.markAllAsRead);
router.put('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;
