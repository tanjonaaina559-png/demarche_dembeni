const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public — no auth
router.post('/', contactController.sendContactMessage);

// Admin only
router.get('/', protect, admin, contactController.getContactMessages);
router.put('/:id/read', protect, admin, contactController.markContactRead);

module.exports = router;
