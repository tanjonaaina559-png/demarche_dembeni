const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const cloudinaryPdfUpload = require('../middleware/cloudinaryPdfUpload');
const {
  getAllTemplates,
  getTemplateByProcedure,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/officialPdfTemplateController');

// Public: get template by procedure (for citizen PDF generation)
router.get('/by-procedure/:procedureId', getTemplateByProcedure);

// Admin — tous les uploads passent par cloudinaryPdfUpload
router.get('/', protect, admin, getAllTemplates);
router.post('/', protect, admin, cloudinaryPdfUpload.single('templateFile'), createTemplate);
router.put('/:id', protect, admin, cloudinaryPdfUpload.single('templateFile'), updateTemplate);
router.delete('/:id', protect, admin, deleteTemplate);

module.exports = router;
