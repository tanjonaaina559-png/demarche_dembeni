const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier dédié aux images des démarches
const imageDir = path.join(__dirname, '../uploads/procedures');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/procedures/');
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `proc-${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = /image\/(jpeg|png|webp)/.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les formats JPG, PNG et WEBP sont acceptés pour les images.'));
  }
};

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

module.exports = imageUpload;
