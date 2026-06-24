const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.get('/', formController.getAllForms);
router.post('/:id/download', formController.incrementDownload);

// Admin only
router.post('/', protect, admin, formController.createForm);
router.put('/:id', protect, admin, formController.updateForm);
router.delete('/:id', protect, admin, formController.deleteForm);

module.exports = router;
