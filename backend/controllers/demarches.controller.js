const Request = require('../models/Request');
const Procedure = require('../models/Procedure');
const UploadedDocument = require('../models/UploadedDocument');
const mongoose = require('mongoose');

exports.getDemarches = async (req, res) => {
  try {
    const procedures = await Procedure.find({ isActive: true });
    const mapped = procedures.map(p => ({
      id: p.slug || p._id.toString(),
      _id: p._id,
      category: p.category,
      icon: p.icon || 'fas fa-file-alt',
      title: p.title,
      badge: p.price || p.fees || 'Gratuit',
      badgeClass: p.category === 'civil' ? 'badge-vert' : p.category === 'documents' ? 'badge-bleu' : 'badge-gris',
      desc: p.description,
      description: p.description,
      info: p.duration || p.processingTime || 'Variable',
      infoIcon: 'far fa-clock',
      processingTime: p.duration || p.processingTime || 'Variable',
      requiredDocs: p.requiredDocs || [],
      image: p.image,
      backgroundImage: p.backgroundImage,
      statistics: p.statistics,
      features: p.features,
      documents: p.documents,
      steps: p.steps,
      detailedDescription: p.detailedDescription,
      buttonText: p.buttonText,
      buttonLink: p.buttonLink
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des démarches', error: error.message });
  }
};

exports.getDemarcheById = async (req, res) => {
  try {
    const identifier = req.params.id;
    const isId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isId
      ? { $or: [{ _id: identifier }, { slug: identifier }] }
      : { slug: identifier };

    const p = await Procedure.findOne(query);
    if (!p) {
      return res.status(404).json({ message: 'Démarche introuvable' });
    }
    
    res.json({
      id: p.slug || p._id.toString(),
      _id: p._id,
      category: p.category,
      icon: p.icon || 'fas fa-file-alt',
      title: p.title,
      badge: p.price || p.fees || 'Gratuit',
      badgeClass: p.category === 'civil' ? 'badge-vert' : p.category === 'documents' ? 'badge-bleu' : 'badge-gris',
      desc: p.description,
      description: p.description,
      info: p.duration || p.processingTime || 'Variable',
      infoIcon: 'far fa-clock',
      processingTime: p.duration || p.processingTime || 'Variable',
      requiredDocs: p.requiredDocs || [],
      image: p.image,
      backgroundImage: p.backgroundImage,
      statistics: p.statistics,
      features: p.features,
      documents: p.documents,
      steps: p.steps,
      detailedDescription: p.detailedDescription,
      buttonText: p.buttonText,
      buttonLink: p.buttonLink
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { procedure, formData } = req.body;
    let parsedData = formData;
    if (typeof formData === 'string') {
      parsedData = JSON.parse(formData);
    }
    
    // Handle file uploads properly using UploadedDocument model
    const uploadedDocs = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const doc = new UploadedDocument({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          uploader: req.user._id
        });
        await doc.save();
        uploadedDocs.push(doc._id);
      }
    }
    
    const request = await Request.create({
      citizenId: req.user._id,
      procedureId: procedure,
      formData: parsedData,
      uploadedFiles: uploadedDocs
    });
    
    // Populate the response
    const populatedRequest = await request.populate('citizenId', 'firstname lastname email').populate('uploadedFiles');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de la request' });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ citizenId: req.params.id })
      .populate('procedureId', 'title category')
      .populate('uploadedFiles')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des requests' });
  }
};

// Admin Endpoints
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('citizenId', 'firstname lastname email')
      .populate('procedureId', 'title category')
      .populate('uploadedFiles')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des requests' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request non trouvée' });
    }
    
    request.status = status || request.status;
    if (adminComment !== undefined) {
      request.adminComment = adminComment;
    }
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total     = await Request.countDocuments();
    const approuvees = await Request.countDocuments({ status: 'Validée' });
    const rejetees   = await Request.countDocuments({ status: 'Rejetée' });
    const attente    = await Request.countDocuments({ status: 'En attente' });

    // Evolution mensuelle (année en cours)
    const currentYear = new Date().getFullYear();
    const requestsPerMonth = await Request.aggregate([
      { $match: { createdAt: { $gte: new Date(`${currentYear}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
    const monthlyData = requestsPerMonth.map(item => ({
      month: months[item._id - 1],
      count: item.count
    }));

    // Répartition par type de démarche
    const parProcedure = await Request.aggregate([
      { $group: { _id: '$procedureId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ total, approuvees, rejetees, attente, monthlyData, parProcedure });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request non trouvée' });
    }
    await Request.deleteOne({ _id: req.params.id });
    res.json({ message: 'Request supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
