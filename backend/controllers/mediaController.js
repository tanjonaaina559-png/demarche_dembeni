const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');
const multer = require('multer');

// Configure multer for file uploads
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer for file uploads to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'dembeni/media',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
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
  console.log('\n========== BACKEND: uploadMedia ROUTE HIT ==========');
  console.log('req.file exists?', !!req.file);
  
  try {
    if (!req.file) {
      console.log('Error: req.file is missing!');
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    console.log('--- CLOUDINARY FILE DATA ---');
    console.log('req.file.path (secure_url):', req.file.path);
    console.log('req.file.filename (public_id):', req.file.filename);
    console.log('req.file.mimetype:', req.file.mimetype);

    const { category, alt, title, tags } = req.body;

    const fileUrl = req.file.path; // Cloudinary secure_url
    const filePath = req.file.filename; // Cloudinary public_id

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
    // Clean up file if error occurs (on Cloudinary, we'd need to use uploader.destroy, but file might not be saved if err here)
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (e) {
        console.error('Error deleting file from Cloudinary:', e);
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
        const fileUrl = file.path; // Cloudinary secure_url
        const filePath = file.filename; // Cloudinary public_id

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

    // Delete file from Cloudinary
    if (media.filePath) {
      try {
        await cloudinary.uploader.destroy(media.filePath);
      } catch (err) {
        console.error('Error deleting file from Cloudinary:', err);
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
