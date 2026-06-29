const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { protect, admin } = require('../middleware/authMiddleware');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Public route for frontend
router.get('/', homeController.getHomeData);

// Admin routes
router.get('/all', protect, admin, homeController.getAllHomeData);
router.post('/', protect, admin, cloudinaryUpload.single('image'), homeController.createHomeContent);
router.put('/:id', protect, admin, cloudinaryUpload.single('image'), homeController.updateHomeContent);
router.delete('/:id', protect, admin, homeController.deleteHomeContent);

module.exports = router;
