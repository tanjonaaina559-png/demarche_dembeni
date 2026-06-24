const Procedure = require('../models/Procedure');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// ─── Helpers ────────────────────────────────────────────────────────────────

const safeParseJSON = (raw, fallback = []) => {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (error) {
    // If it's a comma-separated string, try to turn it into required documents format or array of strings
    if (typeof raw === 'string') {
      return raw.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, required: true }));
    }
    return fallback;
  }
};

const getRelativePath = (absolutePath) => {
  if (!absolutePath) return '';
  const normalizedPath = absolutePath.replace(/\\/g, '/');
  const index = normalizedPath.indexOf('uploads/images/');
  if (index !== -1) {
    return normalizedPath.substring(index);
  }
  return normalizedPath;
};

const deleteOldImage = (imagePath) => {
  if (!imagePath) return;
  const full = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch (e) {
      console.error('Erreur lors de la suppression de l\'ancienne image:', e.message);
    }
  }
};

// ─── GET ALL ────────────────────────────────────────────────────────────────

exports.getAllProcedures = async (req, res) => {
  try {
    const { category, active, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const procedures = await Procedure.find(filter).sort({ createdAt: -1 });
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ─── GET ONE (ID or Slug) ───────────────────────────────────────────────────

exports.getProcedureDetails = async (req, res) => {
  try {
    const identifier = req.params.id;
    const isId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isId
      ? { $or: [{ _id: identifier }, { slug: identifier }] }
      : { slug: identifier };

    const procedure = await Procedure.findOne(query);
    if (!procedure) return res.status(404).json({ message: 'Démarche introuvable' });
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ─── CREATE ─────────────────────────────────────────────────────────────────

exports.createProcedure = async (req, res) => {
  try {
    const {
      title, slug, category, description, detailedDescription,
      statistics, features, documents, steps, requiredFields,
      duration, price, status, buttonText, buttonLink, isActive
    } = req.body;

    let imagePath = '';
    let bgImagePath = '';

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        imagePath = getRelativePath(req.files['image'][0].path);
      }
      if (req.files['backgroundImage'] && req.files['backgroundImage'][0]) {
        bgImagePath = getRelativePath(req.files['backgroundImage'][0].path);
      }
    } else if (req.file) {
      imagePath = getRelativePath(req.file.path);
    }

    const procedure = new Procedure({
      title,
      slug: slug || undefined,
      category,
      description,
      detailedDescription: detailedDescription || '',
      image: imagePath,
      imageUrl: imagePath,
      backgroundImage: bgImagePath,
      statistics: safeParseJSON(statistics),
      features: safeParseJSON(features),
      documents: safeParseJSON(documents),
      requiredFields: safeParseJSON(requiredFields),
      steps: safeParseJSON(steps),
      duration: duration || '',
      price: price || 'Gratuit',
      status: status || 'active',
      buttonText: buttonText || 'Faire la demande',
      buttonLink: buttonLink || '',
      isActive: isActive === 'false' ? false : true,
      createdBy: req.user?._id
    });

    await procedure.save();
    res.status(201).json({ message: 'Démarche créée avec succès', procedure });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ─── UPDATE ─────────────────────────────────────────────────────────────────

exports.updateProcedure = async (req, res) => {
  try {
    const procedure = await Procedure.findById(req.params.id);
    if (!procedure) return res.status(404).json({ message: 'Démarche introuvable' });

    const {
      title, slug, category, description, detailedDescription,
      statistics, features, documents, steps, requiredFields,
      duration, price, status, buttonText, buttonLink, isActive
    } = req.body;

    procedure.title = title ?? procedure.title;
    if (slug !== undefined) procedure.slug = slug;
    procedure.category = category ?? procedure.category;
    procedure.description = description ?? procedure.description;
    procedure.detailedDescription = detailedDescription ?? procedure.detailedDescription;
    procedure.duration = duration ?? procedure.duration;
    procedure.price = price ?? procedure.price;
    procedure.status = status ?? procedure.status;
    procedure.buttonText = buttonText ?? procedure.buttonText;
    procedure.buttonLink = buttonLink ?? procedure.buttonLink;

    if (isActive !== undefined) {
      procedure.isActive = isActive === 'true' || isActive === true;
    }

    if (statistics !== undefined) procedure.statistics = safeParseJSON(statistics);
    if (features !== undefined) procedure.features = safeParseJSON(features);
    if (documents !== undefined) procedure.documents = safeParseJSON(documents);
    if (requiredFields !== undefined) procedure.requiredFields = safeParseJSON(requiredFields);
    if (steps !== undefined) procedure.steps = safeParseJSON(steps);

    // Replace images if uploaded
    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        deleteOldImage(procedure.image);
        deleteOldImage(procedure.imageUrl);
        procedure.image = getRelativePath(req.files['image'][0].path);
        procedure.imageUrl = getRelativePath(req.files['image'][0].path);
      }
      if (req.files['backgroundImage'] && req.files['backgroundImage'][0]) {
        deleteOldImage(procedure.backgroundImage);
        procedure.backgroundImage = getRelativePath(req.files['backgroundImage'][0].path);
      }
    } else if (req.file) {
      deleteOldImage(procedure.image);
      deleteOldImage(procedure.imageUrl);
      procedure.image = getRelativePath(req.file.path);
      procedure.imageUrl = getRelativePath(req.file.path);
    }

    await procedure.save();
    res.json({ message: 'Démarche mise à jour', procedure });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ─── TOGGLE ACTIVE ──────────────────────────────────────────────────────────

exports.toggleProcedureActive = async (req, res) => {
  try {
    const procedure = await Procedure.findById(req.params.id);
    if (!procedure) return res.status(404).json({ message: 'Démarche introuvable' });
    
    procedure.isActive = !procedure.isActive;
    await procedure.save();
    res.json({ message: `Démarche ${procedure.isActive ? 'activée' : 'désactivée'}`, procedure });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ─── DELETE ─────────────────────────────────────────────────────────────────

exports.deleteProcedure = async (req, res) => {
  try {
    const procedure = await Procedure.findByIdAndDelete(req.params.id);
    if (!procedure) return res.status(404).json({ message: 'Démarche introuvable' });
    
    deleteOldImage(procedure.image);
    deleteOldImage(procedure.backgroundImage);
    res.json({ message: 'Démarche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
