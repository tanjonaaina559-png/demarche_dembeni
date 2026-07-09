const User = require('../models/User');
const Request = require('../models/Request');
const Procedure = require('../models/Procedure');
const emailService = require('../utils/emailService');
const { createNotification } = require('../utils/notificationHelper');

// ── Citoyens ──────────────────────────────────────────────────────────────────

const getCitizens = async (req, res) => {
  try {
    const citizens = await User.find({ role: 'citizen' }).select('-password').sort({ createdAt: -1 });
    res.json(citizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCitizen = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Citoyen non trouvé' });

    user.firstname = req.body.firstname || user.firstname;
    user.lastname  = req.body.lastname  || user.lastname;
    user.email     = req.body.email     || user.email;
    user.phone     = req.body.phone     || user.phone;
    user.CIN       = req.body.CIN       || user.CIN;
    user.address   = req.body.address   || user.address;

    await user.save();
    res.json({ message: 'Citoyen mis à jour', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCitizen = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Citoyen non trouvé' });

    user.status = 'approved';
    await user.save();

    await createNotification(user._id, 'Compte validé', 'Votre compte citoyen a été validé par l\'administration.', 'validation');

    await emailService.sendEmail({
      email: user.email,
      subject: 'Compte validé - Mairie de Dembéni',
      message: `Bonjour ${user.firstname || ''},\n\nVotre compte citoyen sur la plateforme de la Mairie de Dembéni a été validé avec succès.\nVous pouvez maintenant vous connecter et commencer vos démarches en ligne.\n\nCordialement,\nMairie de Dembéni`,
    });

    res.json({ message: 'Citoyen validé', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectCitizen = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Citoyen non trouvé' });

    user.status = 'rejected';
    await user.save();

    await createNotification(user._id, 'Compte refusé', 'Votre demande d\'inscription a été refusée.', 'rejection');

    await emailService.sendEmail({
      email: user.email,
      subject: "Mise à jour de votre request d'inscription",
      message: `Bonjour ${user.firstname || ''},\n\nVotre request d'inscription sur la plateforme de la Mairie de Dembéni a été refusée pour le moment.\nVeuillez contacter la mairie pour plus d'informations.\n\nCordialement,\nMairie de Dembéni`,
    });

    res.json({ message: 'Citoyen refusé', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCitizen = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Citoyen non trouvé' });

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'Citoyen supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suspendCitizen = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Citoyen non trouvé' });

    user.status = 'rejected';
    await user.save();

    await createNotification(user._id, 'Compte suspendu', 'Votre compte a été suspendu par l\'administration.', 'rejection');

    res.json({ message: 'Citoyen suspendu', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateCitizen = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Citoyen non trouvé' });

    user.status = 'approved';
    await user.save();

    await createNotification(user._id, 'Compte réactivé', 'Votre compte a été réactivé par l\'administration.', 'validation');

    res.json({ message: 'Citoyen activé', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Statistiques basiques ─────────────────────────────────────────────────────

const getStats = async (req, res) => {
  try {
    const totalCitizens   = await User.countDocuments({ role: 'citizen' });
    const pendingCitizens = await User.countDocuments({ role: 'citizen', status: 'pending' });
    res.json({ totalCitizens, pendingCitizens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Statistiques complètes (Dashboard + Statistics pages) ────────────────────

const getFullStats = async (req, res) => {
  try {
    // Comptes de base
    const totalCitizens    = await User.countDocuments({ role: 'citizen' });
    const pendingCitizens  = await User.countDocuments({ role: 'citizen', status: 'pending' });
    const totalProcedures  = await Procedure.countDocuments();
    const activeProcedures = await Procedure.countDocuments({ isActive: true });

    // Requests
    const total      = await Request.countDocuments();
    const approuvees = await Request.countDocuments({ status: 'Validée' });
    const rejetees   = await Request.countDocuments({ status: 'Rejetée' });
    const attente    = await Request.countDocuments({ status: 'En attente' });

    // Évolution mensuelle (année en cours)
    const currentYear = new Date().getFullYear();
    const requestsPerMonth = await Request.aggregate([
      { $match: { createdAt: { $gte: new Date(`${currentYear}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = requestsPerMonth.map(item => ({
      month: months[item._id - 1],
      count: item.count,
    }));

    // Par type de démarche (top 10)
    const parProcedure = await Request.aggregate([
      { $group: { _id: '$procedureId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Activité récente (dernières 10 requests)
    const recentActivity = await Request.find()
      .populate('citizenId', 'firstname lastname email')
      .populate('procedureId', 'title category')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('citizenId procedureId status createdAt');

    res.json({
      // Citoyens
      totalCitizens,
      pendingCitizens,
      // Procédures
      totalProcedures,
      activeProcedures,
      // Requests
      total,
      approuvees,
      rejetees,
      attente,
      // Graphiques
      monthlyData,
      parProcedure,
      recentActivity,
      // Compatibilité Dashboard (ancien format)
      pendingRequests:  attente,
      approvedRequests: approuvees,
      rejectedRequests: rejetees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCitizens,
  updateCitizen,
  validateCitizen,
  rejectCitizen,
  deleteCitizen,
  suspendCitizen,
  activateCitizen,
  getStats,
  getFullStats,
};
