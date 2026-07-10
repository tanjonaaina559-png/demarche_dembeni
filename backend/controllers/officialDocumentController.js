const OfficialDocument = require('../models/OfficialDocument');
const cloudinary = require('../config/cloudinary');

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

    console.log('\n========== OFFICIAL DOCUMENT UPLOAD ==========');
    console.log('Uploading PDF to Cloudinary...');
    console.log('REQ FILE =', req.file);
    console.log('CLOUDINARY PATH =', req.file?.path);
    console.log('FILENAME =', req.file?.filename);

    const cloudinaryUrl = req.file.path;

    if (!cloudinaryUrl || !cloudinaryUrl.startsWith('https://res.cloudinary.com/')) {
      console.error('[OfficialDocument] URL locale détectée — upload Cloudinary échoué:', cloudinaryUrl);
      return res.status(500).json({
        message: 'Erreur: le fichier n\'a pas été uploadé sur Cloudinary. URL invalide: ' + cloudinaryUrl,
      });
    }

    console.log('Cloudinary Upload Success');
    console.log('Cloudinary URL:', cloudinaryUrl);

    const document = await OfficialDocument.create({
      title,
      description,
      category,
      fileName: req.file.originalname,
      pdfUrl: cloudinaryUrl,
      size: req.file.size,
      active: active === 'true' || active === true,
    });

    console.log('PDF URL saved in MongoDB:', cloudinaryUrl);
    console.log('==============================================\n');

    res.status(201).json(document);
  } catch (error) {
    console.error('[OfficialDocument] Erreur création:', error);
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
      // Supprimer l'ancien fichier Cloudinary si l'URL est Cloudinary
      if (document.pdfUrl && document.pdfUrl.includes('cloudinary')) {
        try {
          const publicIdMatch = document.pdfUrl.match(/\/v\d+\/(.+)$/);
          if (publicIdMatch) {
            let publicId = publicIdMatch[1];
            if (publicId.includes('.')) publicId = publicId.substring(0, publicId.lastIndexOf('.'));
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            console.log('[OfficialDocument] Ancien fichier Cloudinary supprimé:', publicId);
          }
        } catch (e) {
          console.error('[OfficialDocument] Erreur suppression ancien Cloudinary:', e);
        }
      }

      console.log('\n========== OFFICIAL DOCUMENT UPDATE UPLOAD ==========');
      console.log('Uploading PDF to Cloudinary...');
      console.log('REQ FILE =', req.file);
      console.log('CLOUDINARY PATH =', req.file?.path);
      console.log('FILENAME =', req.file?.filename);

      const cloudinaryUrl = req.file.path;

      if (!cloudinaryUrl || !cloudinaryUrl.startsWith('https://res.cloudinary.com/')) {
        console.error('[OfficialDocument] URL locale détectée lors de la mise à jour:', cloudinaryUrl);
        return res.status(500).json({
          message: 'Erreur: le fichier n\'a pas été uploadé sur Cloudinary. URL invalide: ' + cloudinaryUrl,
        });
      }

      console.log('Cloudinary Upload Success');
      console.log('Cloudinary URL:', cloudinaryUrl);

      document.fileName = req.file.originalname;
      document.pdfUrl = cloudinaryUrl;
      document.size = req.file.size;

      console.log('PDF URL saved in MongoDB:', cloudinaryUrl);
      console.log('=====================================================\n');
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } catch (error) {
    console.error('[OfficialDocument] Erreur mise à jour:', error);
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

    // Supprimer le fichier Cloudinary
    if (document.pdfUrl && document.pdfUrl.includes('cloudinary')) {
      try {
        const publicIdMatch = document.pdfUrl.match(/\/v\d+\/(.+)$/);
        if (publicIdMatch) {
          let publicId = publicIdMatch[1];
          if (publicId.includes('.')) publicId = publicId.substring(0, publicId.lastIndexOf('.'));
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          console.log('Fichier Cloudinary supprimé lors de la suppression du document:', publicId);
        }
      } catch (e) {
        console.error('Erreur suppression Cloudinary:', e);
      }
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
