const HomeContent = require('../models/HomeContent');
const HomeCard = require('../models/HomeCard');
const multer = require('multer');
const path = require('path');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'dembeni/home',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resource_type: 'auto',
      public_id: `home-${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('image');

exports.getHomeData = async (req, res) => {
  try {
    const contents = await HomeContent.find({ isActive: true });
    const cards = await HomeCard.find({ isActive: true }).sort('order');
    res.json({ contents, cards });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des données", error: err.message });
  }
};

exports.getAllHomeData = async (req, res) => {
  try {
    const contents = await HomeContent.find();
    const cards = await HomeCard.find().sort('order');
    res.json({ contents, cards });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des données", error: err.message });
  }
};

exports.createHomeContent = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data[req.body.imageField || 'imageUrl'] = req.file.path; // Cloudinary secure_url
    }
    // Handle JSON parsed arrays/objects if sent as string
    ['statistics', 'activities', 'tarifs', 'advantages', 'steps', 'schedule', 'socialLinks', 'informations'].forEach(field => {
      if (typeof data[field] === 'string') {
        try { data[field] = JSON.parse(data[field]); } catch(e) {}
      }
    });

    if (data.type === 'card') {
      const card = new HomeCard(data);
      await card.save();
      res.status(201).json(card);
    } else {
      const content = new HomeContent(data);
      await content.save();
      res.status(201).json(content);
    }
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la création", error: err.message });
  }
};

exports.updateHomeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file) {
      data[req.body.imageField || 'imageUrl'] = req.file.path; // Cloudinary secure_url
    }
    
    ['statistics', 'activities', 'tarifs', 'advantages', 'steps', 'schedule', 'socialLinks', 'informations'].forEach(field => {
      if (typeof data[field] === 'string') {
        try { data[field] = JSON.parse(data[field]); } catch(e) {}
      }
    });

    let updated;
    if (data.type === 'card') {
      updated = await HomeCard.findByIdAndUpdate(id, data, { new: true });
    } else {
      updated = await HomeContent.findByIdAndUpdate(id, data, { new: true });
    }
    
    if (!updated) return res.status(404).json({ message: "Élément non trouvé" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
  }
};

exports.deleteHomeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    let deleted;
    if (type === 'card') {
      deleted = await HomeCard.findByIdAndDelete(id);
    } else {
      deleted = await HomeContent.findByIdAndDelete(id);
    }
    
    if (!deleted) return res.status(404).json({ message: "Élément non trouvé" });
    res.json({ message: "Élément supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression", error: err.message });
  }
};
