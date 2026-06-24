const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UploadedDocument = require('../models/UploadedDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage config for citizen personal documents
const uploadDir = path.join(__dirname, '..', 'uploads', 'citizen-docs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadDir); },
  filename(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `doc-${req.user._id}-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype) || file.mimetype === 'application/pdf';
  if (ext && mime) cb(null, true);
  else cb(new Error('Format non autorisé. Utilisez PDF, JPG ou PNG.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/documents — List citizen documents
router.get('/', protect, async (req, res) => {
  try {
    const docs = await UploadedDocument.find({ uploader: req.user._id }).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/documents — Upload a citizen document
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

    const doc = await UploadedDocument.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path.replace(/\\/g, '/'),
      uploader: req.user._id
    });

    res.status(201).json({ message: 'Document téléchargé avec succès', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/documents/:id — Delete a document
router.delete('/:id', protect, async (req, res) => {
  try {
    const doc = await UploadedDocument.findOne({ _id: req.params.id, uploader: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document introuvable.' });

    // Delete file from disk
    if (fs.existsSync(doc.path)) {
      try { fs.unlinkSync(doc.path); } catch (e) { /* ignore */ }
    }

    await UploadedDocument.deleteOne({ _id: doc._id });
    res.json({ message: 'Document supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/documents/:id/download — Download a document
router.get('/:id/download', protect, async (req, res) => {
  try {
    const doc = await UploadedDocument.findOne({ _id: req.params.id, uploader: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document introuvable.' });
    if (!fs.existsSync(doc.path)) return res.status(404).json({ message: 'Fichier introuvable sur le serveur.' });

    res.download(doc.path, doc.originalName);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
