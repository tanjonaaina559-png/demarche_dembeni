const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, notificationController.getNotifications);
// IMPORTANT: /read-all must come BEFORE /:id/read to avoid route conflict
router.put('/read-all', protect, notificationController.markAllAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;
