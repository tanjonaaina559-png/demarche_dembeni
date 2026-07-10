const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const cloudinaryPdfUpload = require('../middleware/cloudinaryPdfUpload');
const {
  getAllDocuments,
  getActiveDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  toggleStatus,
} = require('../controllers/officialDocumentController');

// Routes
router.get('/active', getActiveDocuments); // Accès public

router.route('/')
  .get(protect, admin, getAllDocuments)
  .post(protect, admin, cloudinaryPdfUpload.single('pdf'), createDocument);

router.route('/:id')
  .put(protect, admin, cloudinaryPdfUpload.single('pdf'), updateDocument)
  .delete(protect, admin, deleteDocument);

router.patch('/:id/toggle', protect, admin, toggleStatus);

module.exports = router;
