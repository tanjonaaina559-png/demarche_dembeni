const Form = require('../models/Form');

// GET /api/forms — public
exports.getAllForms = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const forms = await Form.find(filter).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/forms — admin only
exports.createForm = async (req, res) => {
  try {
    const { title, description, category, fileUrl, fileName, fileSize } = req.body;
    if (!title || !fileUrl) {
      return res.status(400).json({ message: 'Titre et URL du fichier requis.' });
    }
    const form = new Form({ title, description, category, fileUrl, fileName, fileSize });
    await form.save();
    res.status(201).json({ message: 'Formulaire créé.', form });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/forms/:id — admin only
exports.updateForm = async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!form) return res.status(404).json({ message: 'Formulaire non trouvé.' });
    res.json({ message: 'Formulaire mis à jour.', form });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/forms/:id — admin only
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ message: 'Formulaire non trouvé.' });
    res.json({ message: 'Formulaire supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/forms/:id/download — increment download count
exports.incrementDownload = async (req, res) => {
  try {
    await Form.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.json({ message: 'ok' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
