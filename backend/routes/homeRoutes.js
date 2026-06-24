const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { protect, admin } = require('../middleware/authMiddleware'); // assuming these exist

// Public route for frontend
router.get('/', homeController.getHomeData);

// Admin routes
router.get('/all', protect, admin, homeController.getAllHomeData);
router.post('/', protect, admin, homeController.uploadMiddleware, homeController.createHomeContent);
router.put('/:id', protect, admin, homeController.uploadMiddleware, homeController.updateHomeContent);
router.delete('/:id', protect, admin, homeController.deleteHomeContent);

module.exports = router;
