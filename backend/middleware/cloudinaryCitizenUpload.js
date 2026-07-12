/**
 * cloudinaryCitizenUpload.js
 * Middleware multer qui stocke les pièces justificatives des citoyens
 * directement sur Cloudinary (dossier: dembeni/citizen-docs).
 * Remplace uploadPdfMiddleware.js (stockage local /uploads/citizen-docs/).
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('\n========== CLOUDINARY CITIZEN DOC UPLOAD ==========');
    console.log('Fichier reçu:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    const params = {
      folder: 'dembeni/citizen-docs',
      resource_type: 'raw',
      public_id: `doc-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`,
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    };

    console.log('Cloudinary params:', params);
    console.log('===================================================\n');
    return params;
  },
});

const cloudinaryCitizenUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error('[cloudinaryCitizenUpload] Type de fichier rejeté:', file.mimetype);
      cb(new Error('Seuls les fichiers PDF, JPG et PNG sont autorisés.'), false);
    }
  },
});

module.exports = cloudinaryCitizenUpload;
