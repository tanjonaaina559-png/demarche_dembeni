const OfficialPdfTemplate = require('../models/OfficialPdfTemplate');
const Procedure = require('../models/Procedure');
const fs = require('fs');
const path = require('path');

// ── GET all templates (Admin) ──────────────────────────────────────────────────
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await OfficialPdfTemplate.find()
      .populate('procedureId', 'title category')
      .sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ── GET template by procedureId ────────────────────────────────────────────────
exports.getTemplateByProcedure = async (req, res) => {
  try {
    const template = await OfficialPdfTemplate.findOne({
      procedureId: req.params.procedureId,
      status: 'active',
    });
    if (!template) {
      return res.status(404).json({ message: 'Aucun template PDF pour cette procédure.' });
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ── CREATE template ───────────────────────────────────────────────────────────
exports.createTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Veuillez télécharger un fichier PDF.' });
    }

    const { title, procedureId, mapping, status, isDemonstration } = req.body;

    let parsedMapping = [];
    if (mapping) {
      try {
        parsedMapping = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
      } catch (e) {
        parsedMapping = [];
      }
    }

    const template = await OfficialPdfTemplate.create({
      title,
      procedureId: procedureId && procedureId !== 'null' ? procedureId : null,
      templateFile: `/uploads/pdf-templates/${req.file.filename}`,
      fileName: req.file.originalname,
      size: req.file.size,
      mapping: parsedMapping,
      status: status || 'active',
      isDemonstration: isDemonstration === 'true' || isDemonstration === true
    });

    const populated = await OfficialPdfTemplate.findById(template._id).populate('procedureId', 'title category');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ── UPDATE template ───────────────────────────────────────────────────────────
exports.updateTemplate = async (req, res) => {
  try {
    const template = await OfficialPdfTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template introuvable' });

    const { title, procedureId, mapping, status, isDemonstration } = req.body;

    if (title) template.title = title;
    if (status) template.status = status;
    if (procedureId !== undefined) {
      template.procedureId = procedureId && procedureId !== 'null' ? procedureId : null;
    }
    if (isDemonstration !== undefined) {
      template.isDemonstration = isDemonstration === 'true' || isDemonstration === true;
    }

    if (mapping) {
      try {
        const parsed = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
        template.mapping = parsed;
      } catch (e) {}
    }

    if (req.file) {
      // Remove old file
      const oldPath = path.join(__dirname, '..', template.templateFile);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
      template.templateFile = `/uploads/pdf-templates/${req.file.filename}`;
      template.fileName = req.file.originalname;
      template.size = req.file.size;
    }

    await template.save();
    const populated = await OfficialPdfTemplate.findById(template._id).populate('procedureId', 'title category');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ── DELETE template ───────────────────────────────────────────────────────────
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await OfficialPdfTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template introuvable' });

    const filePath = path.join(__dirname, '..', template.templateFile);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }

    await template.deleteOne();
    res.json({ message: 'Template supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
