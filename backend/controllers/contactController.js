const ContactMessage = require('../models/ContactMessage');

// POST /api/contact — public, no auth required
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, service, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    }

    const contact = new ContactMessage({ name, email, phone, service, subject, message });
    await contact.save();

    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/contact — admin only
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/contact/:id/read — admin only
exports.markContactRead = async (req, res) => {
  try {
    await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marqué comme lu.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
