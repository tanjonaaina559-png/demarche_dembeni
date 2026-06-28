const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('\n========== CLOUDINARY UPLOAD ==========');
    console.log('File received by Multer:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      encoding: file.encoding,
    });

    const params = {
      folder: 'dembeni/procedures',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx'],
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };

    console.log('Cloudinary upload params:', params);
    console.log('=======================================\n');
    return params;
  },
});

const cloudinaryUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB — increased for safety
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error('[cloudinaryUpload] Rejected file type:', file.mimetype);
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
    }
  },
});

module.exports = cloudinaryUpload;