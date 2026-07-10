/**
 * cloudinaryPdfUpload.js
 * Middleware multer qui stocke les PDF directement sur Cloudinary.
 * Dossier : dembeni/documents | resource_type: raw
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('\n========== CLOUDINARY PDF UPLOAD ==========');
    console.log('Fichier reçu par Multer:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const params = {
      folder: 'dembeni/documents',
      resource_type: 'raw',
      public_id: `official-${Date.now()}-${file.originalname.split('.')[0]}`,
      allowed_formats: ['pdf'],
    };

    console.log('Cloudinary PDF upload params:', params);
    console.log('===========================================\n');
    return params;
  },
});

const cloudinaryPdfUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      console.error('[cloudinaryPdfUpload] Type de fichier rejeté:', file.mimetype);
      cb(new Error('Seuls les fichiers PDF sont autorisés.'), false);
    }
  },
});

module.exports = cloudinaryPdfUpload;
