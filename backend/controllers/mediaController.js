const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'media');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ────────────────────────────────────────────────────────────────────────────
// UPLOAD MEDIA
// ────────────────────────────────────────────────────────────────────────────

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { category, alt, title, tags } = req.body;

    const filePath = `uploads/media/${req.file.filename}`;
    const fileUrl = `/uploads/media/${req.file.filename}`;

    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filePath: filePath,
      url: fileUrl,
      category: category || 'other',
      alt: alt || req.file.originalname,
      title: title || req.file.originalname,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      uploadedBy: req.user._id,
      uploadedFrom: 'admin'
    });

    res.status(201).json({
      message: 'Fichier uploadé avec succès',
      media
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }
    res.status(500).json({ message: 'Erreur lors de l\'upload', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// BULK UPLOAD MEDIA
// ────────────────────────────────────────────────────────────────────────────

exports.bulkUploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { category, tags } = req.body;
    const uploadedMedia = [];

    for (const file of req.files) {
      try {
        const filePath = `uploads/media/${file.filename}`;
        const fileUrl = `/uploads/media/${file.filename}`;

        const media = await Media.create({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          filePath: filePath,
          url: fileUrl,
          category: category || 'other',
          alt: file.originalname,
          title: file.originalname,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          uploadedBy: req.user._id,
          uploadedFrom: 'admin'
        });

        uploadedMedia.push(media);
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
      }
    }

    res.status(201).json({
      message: `${uploadedMedia.length} fichier(s) uploadé(s) avec succès`,
      media: uploadedMedia,
      total: req.files.length,
      successful: uploadedMedia.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du bulk upload', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE MEDIA AND FILE
// ────────────────────────────────────────────────────────────────────────────

exports.deleteMediaFile = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Média introuvable' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', media.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(req.params.id);

    res.json({ message: 'Média supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  upload,
  uploadMedia: exports.uploadMedia,
  bulkUploadMedia: exports.bulkUploadMedia,
  deleteMediaFile: exports.deleteMediaFile
};
