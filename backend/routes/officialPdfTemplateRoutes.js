const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllTemplates,
  getTemplateByProcedure,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/officialPdfTemplateController');

// Ensure upload dir exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'pdf-templates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'tmpl-' + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 30 * 1024 * 1024 } });

// Public: get template by procedure (for citizen PDF generation)
router.get('/by-procedure/:procedureId', getTemplateByProcedure);

// Admin
router.get('/', protect, admin, getAllTemplates);
router.post('/', protect, admin, upload.single('templateFile'), createTemplate);
router.put('/:id', protect, admin, upload.single('templateFile'), updateTemplate);
router.delete('/:id', protect, admin, deleteTemplate);

module.exports = router;
