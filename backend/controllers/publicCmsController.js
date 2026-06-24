const Settings = require('../models/Settings');
const HeroSection = require('../models/HeroSection');
const FAQ = require('../models/FAQ');
const CollecteSchedule = require('../models/CollecteSchedule');
const Media = require('../models/Media');
const Page = require('../models/Page');
const ServiceDescription = require('../models/ServiceDescription');
const Procedure = require('../models/Procedure');
const ServicePublicSection = require('../models/ServicePublicSection');
const LoisirsSection = require('../models/LoisirsSection');
const PassportSection = require('../models/PassportSection');
const FooterSettings = require('../models/FooterSettings');

// PUBLIC ENDPOINTS - NO AUTHENTICATION REQUIRED

// ────────────────────────────────────────────────────────────────────────────
// SETTINGS (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// HERO SECTION (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicHeroSection = async (req, res) => {
  try {
    let hero = await HeroSection.findOne({ isActive: true });
    if (!hero) {
      hero = await HeroSection.findOne();
    }
    if (!hero) {
      hero = await HeroSection.create({});
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FAQ (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate('relatedService', 'title slug');

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getPublicFAQCategories = async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// COLLECTE SCHEDULE (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicCollecteSchedules = async (req, res) => {
  try {
    const filter = { isPublished: true };
    const schedules = await CollecteSchedule.find(filter)
      .sort({ year: -1, month: -1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getLatestCollecteSchedule = async (req, res) => {
  try {
    const schedule = await CollecteSchedule.findOne({ isPublished: true })
      .sort({ year: -1, month: -1 });

    if (!schedule) {
      return res.status(404).json({ message: 'Aucun calendrier disponible' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// SERVICE PUBLIC SECTION (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicServicePublic = async (req, res) => {
  try {
    let section = await ServicePublicSection.findOne();
    if (!section) section = await ServicePublicSection.create({});
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// LOISIRS SECTION (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicLoisirs = async (req, res) => {
  try {
    let section = await LoisirsSection.findOne();
    if (!section) section = await LoisirsSection.create({});
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// PASSPORT SECTION (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicPassport = async (req, res) => {
  try {
    let section = await PassportSection.findOne();
    if (!section) section = await PassportSection.create({});
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FOOTER SETTINGS (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicFooter = async (req, res) => {
  try {
    let footer = await FooterSettings.findOne();
    if (!footer) footer = await FooterSettings.create({});
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// PAGES (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicPages = async (req, res) => {
  try {
    const pages = await Page.find({ 
      status: 'published', 
      isVisible: true,
      requiresAuth: false 
    })
      .sort({ menuOrder: 1, createdAt: -1 })
      .populate('author', 'firstname lastname email');

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getPublicPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ 
      slug,
      status: 'published',
      isVisible: true,
      requiresAuth: false 
    })
      .populate('author', 'firstname lastname email')
      .populate('galleryImages');

    if (!page) {
      return res.status(404).json({ message: 'Page non trouvée' });
    }

    // Increment view count
    page.viewCount = (page.viewCount || 0) + 1;
    await page.save();

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// SERVICE DESCRIPTIONS (Public)
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicServiceDescriptions = async (req, res) => {
  try {
    const descriptions = await ServiceDescription.find()
      .populate('procedure', 'title slug image price duration')
      .populate('relatedProcedures', 'title slug image')
      .populate('relatedFAQs', 'question answer')
      .populate('images');

    res.json(descriptions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getPublicServiceDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const description = await ServiceDescription.findOne({ procedure: id })
      .populate('procedure')
      .populate('relatedProcedures', 'title slug image')
      .populate('relatedFAQs', 'question answer')
      .populate('images');

    if (!description) {
      return res.status(404).json({ message: 'Description non trouvée' });
    }

    // Increment views
    description.views = (description.views || 0) + 1;
    await description.save();

    res.json(description);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// MEDIA (Public) - For fetching image URLs
// ────────────────────────────────────────────────────────────────────────────

exports.getPublicMedia = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const media = await Media.find(filter).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getPublicMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Média introuvable' });

    // Increment download count
    media.downloadCount = (media.downloadCount || 0) + 1;
    await media.save();

    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// COMBO ENDPOINTS - Fetch ALL homepage content in a single API call
// ────────────────────────────────────────────────────────────────────────────

exports.getHomepageData = async (req, res) => {
  try {
    const [settings, hero, faqs, collecteSchedule, procedures, servicePublic, loisirs, passport, footer] = await Promise.all([
      Settings.findOne().catch(() => null),
      HeroSection.findOne({ isActive: true }).catch(() => null),
      FAQ.find({ isActive: true }).sort({ order: 1 }).limit(6).catch(() => []),
      CollecteSchedule.findOne({ isPublished: true }).sort({ year: -1, month: -1 }).catch(() => null),
      Procedure.find({ isActive: true }).sort({ createdAt: -1 }).catch(() => []),
      ServicePublicSection.findOne().catch(() => null),
      LoisirsSection.findOne().catch(() => null),
      PassportSection.findOne().catch(() => null),
      FooterSettings.findOne().catch(() => null),
    ]);

    res.json({
      settings: settings || {},
      hero: hero || {},
      faqs: faqs || [],
      collecteSchedule: collecteSchedule || null,
      procedures: procedures || [],
      servicePublic: servicePublic || {},
      loisirs: loisirs || {},
      passport: passport || {},
      footer: footer || {},
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = exports;
