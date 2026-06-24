const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllDocuments,
  getActiveDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  toggleStatus,
} = require('../controllers/officialDocumentController');

// Multer configuration for official documents
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'official-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  }
});

// Routes
router.get('/active', getActiveDocuments); // Public access

router.route('/')
  .get(protect, admin, getAllDocuments)
  .post(protect, admin, upload.single('pdf'), createDocument);

router.route('/:id')
  .put(protect, admin, upload.single('pdf'), updateDocument)
  .delete(protect, admin, deleteDocument);

router.patch('/:id/toggle', protect, admin, toggleStatus);

module.exports = router;
