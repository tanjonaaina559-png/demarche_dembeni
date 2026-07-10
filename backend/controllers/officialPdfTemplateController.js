const OfficialPdfTemplate = require('../models/OfficialPdfTemplate');
const cloudinary = require('../config/cloudinary');

// ── Helper: extract Cloudinary public_id from URL ──────────────────────────────
function extractPublicId(url) {
  if (!url || !url.includes('cloudinary')) return null;
  const match = url.match(/\/v\d+\/(.+)$/);
  if (!match) return null;
  let publicId = match[1];
  // Strip extension for raw resources
  if (publicId.includes('.')) publicId = publicId.substring(0, publicId.lastIndexOf('.'));
  return publicId;
}

// ── Helper: safely delete old Cloudinary asset ─────────────────────────────────
async function destroyCloudinaryAsset(url) {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('[PDF Template] Ancien fichier Cloudinary supprimé:', publicId);
  } catch (e) {
    console.error('[PDF Template] Erreur suppression Cloudinary:', e.message);
  }
}

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

    console.log('\n========== PDF TEMPLATE UPLOAD ==========');
    console.log('REQ FILE =', req.file);
    console.log('CLOUDINARY PATH =', req.file?.path);
    console.log('FILENAME =', req.file?.filename);

    const cloudinaryUrl = req.file.path;

    // Guard: reject any local URL
    if (!cloudinaryUrl || !cloudinaryUrl.startsWith('https://res.cloudinary.com/')) {
      console.error('[PDF Template] URL locale détectée — upload Cloudinary échoué:', cloudinaryUrl);
      return res.status(500).json({
        message: 'Erreur: le fichier n\'a pas été uploadé sur Cloudinary. URL invalide: ' + cloudinaryUrl,
      });
    }

    console.log('Cloudinary Upload Success');
    console.log('Cloudinary URL:', cloudinaryUrl);

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
      templateFile: cloudinaryUrl,           // ← Cloudinary URL, not local path
      fileName: req.file.originalname,
      size: req.file.size,
      mapping: parsedMapping,
      status: status || 'active',
      isDemonstration: isDemonstration === 'true' || isDemonstration === true,
    });

    console.log('PDF Template URL saved in MongoDB:', cloudinaryUrl);
    console.log('=========================================\n');

    const populated = await OfficialPdfTemplate.findById(template._id).populate('procedureId', 'title category');
    res.status(201).json(populated);
  } catch (err) {
    console.error('[PDF Template] Erreur création:', err);
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
      console.log('\n========== PDF TEMPLATE UPDATE UPLOAD ==========');
      console.log('REQ FILE =', req.file);
      console.log('CLOUDINARY PATH =', req.file?.path);

      const cloudinaryUrl = req.file.path;

      // Guard: reject any local URL
      if (!cloudinaryUrl || !cloudinaryUrl.startsWith('https://res.cloudinary.com/')) {
        console.error('[PDF Template] URL locale détectée lors de la mise à jour:', cloudinaryUrl);
        return res.status(500).json({
          message: 'Erreur: le fichier n\'a pas été uploadé sur Cloudinary. URL invalide: ' + cloudinaryUrl,
        });
      }

      // Delete old Cloudinary asset
      await destroyCloudinaryAsset(template.templateFile);

      template.templateFile = cloudinaryUrl;
      template.fileName = req.file.originalname;
      template.size = req.file.size;

      console.log('Cloudinary Upload Success');
      console.log('Cloudinary URL:', cloudinaryUrl);
      console.log('PDF Template URL saved in MongoDB:', cloudinaryUrl);
      console.log('=================================================\n');
    }

    await template.save();
    const populated = await OfficialPdfTemplate.findById(template._id).populate('procedureId', 'title category');
    res.json(populated);
  } catch (err) {
    console.error('[PDF Template] Erreur mise à jour:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ── DELETE template ───────────────────────────────────────────────────────────
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await OfficialPdfTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template introuvable' });

    // Delete Cloudinary asset (no local file deletion)
    await destroyCloudinaryAsset(template.templateFile);

    await template.deleteOne();
    res.json({ message: 'Template supprimé avec succès' });
  } catch (err) {
    console.error('[PDF Template] Erreur suppression:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
