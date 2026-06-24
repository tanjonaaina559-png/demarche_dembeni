const OfficialDocument = require('../models/OfficialDocument');
const fs = require('fs');
const path = require('path');

// @desc    Get all official documents (Admin)
// @route   GET /api/official-documents
// @access  Private/Admin
const getAllDocuments = async (req, res) => {
  try {
    const documents = await OfficialDocument.find({}).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Get all active official documents (Public)
// @route   GET /api/official-documents/active
// @access  Public
const getActiveDocuments = async (req, res) => {
  try {
    const documents = await OfficialDocument.find({ active: true }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Create an official document
// @route   POST /api/official-documents
// @access  Private/Admin
const createDocument = async (req, res) => {
  try {
    const { title, description, category, active } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Veuillez télécharger un fichier PDF.' });
    }

    const document = await OfficialDocument.create({
      title,
      description,
      category,
      fileName: req.file.originalname,
      pdfUrl: `/uploads/documents/${req.file.filename}`,
      size: req.file.size,
      active: active === 'true' || active === true,
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Update an official document
// @route   PUT /api/official-documents/:id
// @access  Private/Admin
const updateDocument = async (req, res) => {
  try {
    const { title, description, category, active } = req.body;
    const document = await OfficialDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    document.title = title || document.title;
    document.description = description !== undefined ? description : document.description;
    document.category = category || document.category;
    
    if (active !== undefined) {
      document.active = active === 'true' || active === true;
    }

    if (req.file) {
      // Remove old file
      const oldFilePath = path.join(__dirname, '..', document.pdfUrl);
      if (fs.existsSync(oldFilePath)) {
        try { fs.unlinkSync(oldFilePath); } catch (e) { console.error('Error deleting old file', e); }
      }

      document.fileName = req.file.originalname;
      document.pdfUrl = `/uploads/documents/${req.file.filename}`;
      document.size = req.file.size;
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Delete an official document
// @route   DELETE /api/official-documents/:id
// @access  Private/Admin
const deleteDocument = async (req, res) => {
  try {
    const document = await OfficialDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', document.pdfUrl);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error('Error deleting file', e); }
    }

    await document.deleteOne();
    res.json({ message: 'Document supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Toggle active status
// @route   PATCH /api/official-documents/:id/toggle
// @access  Private/Admin
const toggleStatus = async (req, res) => {
  try {
    const document = await OfficialDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document introuvable' });
    }

    document.active = !document.active;
    await document.save();

    res.json({ message: 'Statut mis à jour', active: document.active });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getAllDocuments,
  getActiveDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  toggleStatus,
};
