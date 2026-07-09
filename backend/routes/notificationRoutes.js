const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, notificationController.getNotifications);
router.get('/unread', protect, notificationController.getUnreadNotifications);

// IMPORTANT: /read-all must come BEFORE /:id/read to avoid route conflict
router.put('/read-all', protect, notificationController.markAllAsRead);
router.patch('/read-all', protect, notificationController.markAllAsRead);

router.put('/:id/read', protect, notificationController.markAsRead);
router.patch('/:id/read', protect, notificationController.markAsRead);

router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
