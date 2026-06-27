const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'dembeni/procedures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx'],
    resource_type: 'auto',
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
  }),
});

const cloudinaryUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = cloudinaryUpload;