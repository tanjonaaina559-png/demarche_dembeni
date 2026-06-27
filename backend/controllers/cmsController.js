const Settings = require('../models/Settings');
const HeroSection = require('../models/HeroSection');
const FAQ = require('../models/FAQ');
const CollecteSchedule = require('../models/CollecteSchedule');
const Media = require('../models/Media');
const Page = require('../models/Page');
const ServiceDescription = require('../models/ServiceDescription');

// ────────────────────────────────────────────────────────────────────────────
// SETTINGS MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

exports.getSettings = async (req, res) => {
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

exports.updateSettings = async (req, res) => {
  try {
    const { 
      siteName, siteDescription, contactEmail, contactPhone, contactPhone2, 
      address, openingHours, socialNetworks, footerText, footerLinks, 
      maintenanceMode, maintenanceMessage, emailNotificationsEnabled,
      mapLatitude, mapLongitude, mapUrl, mapMarkerTitle, mapMarkerDescription
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Update only provided fields
    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (contactPhone2 !== undefined) settings.contactPhone2 = contactPhone2;
    if (address !== undefined) settings.address = address;
    if (openingHours) settings.openingHours = openingHours;
    if (socialNetworks) settings.socialNetworks = socialNetworks;
    if (footerText !== undefined) settings.footerText = footerText;
    if (footerLinks) settings.footerLinks = footerLinks;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;
    if (emailNotificationsEnabled !== undefined) settings.emailNotificationsEnabled = emailNotificationsEnabled;
    
    // Map fields
    if (mapLatitude !== undefined) settings.mapLatitude = mapLatitude;
    if (mapLongitude !== undefined) settings.mapLongitude = mapLongitude;
    if (mapUrl !== undefined) settings.mapUrl = mapUrl;
    if (mapMarkerTitle !== undefined) settings.mapMarkerTitle = mapMarkerTitle;
    if (mapMarkerDescription !== undefined) settings.mapMarkerDescription = mapMarkerDescription;

    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    res.json({ message: 'Paramètres mis à jour avec succès', settings });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// HERO SECTION MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

exports.getHeroSection = async (req, res) => {
  try {
    let hero = await HeroSection.findOne();
    if (!hero) {
      hero = await HeroSection.create({});
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateHeroSection = async (req, res) => {
  try {
    const {
      title, subtitle, description, backgroundImage, imageUrl, buttons, stats,
      showStats, showServices, showContactInfo, showAlert, alertText, alertType,
      metaTitle, metaDescription
    } = req.body;

    let hero = await HeroSection.findOne();
    if (!hero) {
      hero = await HeroSection.create({});
    }

    if (title !== undefined) hero.title = title;
    if (subtitle !== undefined) hero.subtitle = subtitle;
    if (description !== undefined) hero.description = description;
    if (backgroundImage !== undefined) hero.backgroundImage = backgroundImage;
    if (imageUrl !== undefined) hero.imageUrl = imageUrl;
    if (buttons) hero.buttons = buttons;
    if (stats) hero.stats = stats;
    if (showStats !== undefined) hero.showStats = showStats;
    if (showServices !== undefined) hero.showServices = showServices;
    if (showContactInfo !== undefined) hero.showContactInfo = showContactInfo;
    if (showAlert !== undefined) hero.showAlert = showAlert;
    if (alertText !== undefined) hero.alertText = alertText;
    if (alertType !== undefined) hero.alertType = alertType;
    if (metaTitle !== undefined) hero.metaTitle = metaTitle;
    if (metaDescription !== undefined) hero.metaDescription = metaDescription;

    hero.lastUpdatedBy = req.user._id;
    await hero.save();

    res.json({ message: 'Section héro mise à jour avec succès', hero });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FAQ MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

exports.getAllFAQs = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 }).populate('relatedService');
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id).populate('relatedService');
    if (!faq) return res.status(404).json({ message: 'FAQ introuvable' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { category, question, answer, order, relatedService, tags } = req.body;

    const faq = await FAQ.create({
      category,
      question,
      answer,
      order: order || 0,
      relatedService,
      tags,
      lastUpdatedBy: req.user._id
    });

    res.status(201).json({ message: 'FAQ créée avec succès', faq });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { category, question, answer, order, isActive, relatedService, tags } = req.body;

    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ introuvable' });

    if (category !== undefined) faq.category = category;
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (order !== undefined) faq.order = order;
    if (isActive !== undefined) faq.isActive = isActive;
    if (relatedService !== undefined) faq.relatedService = relatedService;
    if (tags !== undefined) faq.tags = tags;

    faq.lastUpdatedBy = req.user._id;
    await faq.save();

    res.json({ message: 'FAQ mise à jour avec succès', faq });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ introuvable' });
    res.json({ message: 'FAQ supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// COLLECTE SCHEDULE MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

exports.getCollecteSchedules = async (req, res) => {
  try {
    const { year, month, isPublished } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';

    const schedules = await CollecteSchedule.find(filter).sort({ year: -1, month: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getCollecteSchedule = async (req, res) => {
  try {
    const schedule = await CollecteSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Calendrier introuvable' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.createCollecteSchedule = async (req, res) => {
  try {
    const { year, month, monthName, collectionDates, instructions, importantNotes, contactPerson, contactPhone, posterImage, imageUrl } = req.body;

    const schedule = await CollecteSchedule.create({
      year,
      month,
      monthName,
      collectionDates,
      instructions,
      importantNotes,
      contactPerson,
      contactPhone,
      posterImage: imageUrl || posterImage || '',
      imageUrl: imageUrl || posterImage || '',
      lastUpdatedBy: req.user._id
    });

    res.status(201).json({ message: 'Calendrier de collecte créé avec succès', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateCollecteSchedule = async (req, res) => {
  try {
    const { year, month, monthName, collectionDates, posterImage, imageUrl, instructions, importantNotes, contactPerson, contactPhone, isPublished, displayOnHomepage } = req.body;

    const schedule = await CollecteSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Calendrier introuvable' });

    if (year !== undefined) schedule.year = year;
    if (month !== undefined) schedule.month = month;
    if (monthName !== undefined) schedule.monthName = monthName;
    if (collectionDates) schedule.collectionDates = collectionDates;
    if (posterImage !== undefined) schedule.posterImage = posterImage;
    if (imageUrl !== undefined) schedule.imageUrl = imageUrl;
    if (instructions !== undefined) schedule.instructions = instructions;
    if (importantNotes) schedule.importantNotes = importantNotes;
    if (contactPerson !== undefined) schedule.contactPerson = contactPerson;
    if (contactPhone !== undefined) schedule.contactPhone = contactPhone;
    if (isPublished !== undefined) schedule.isPublished = isPublished;
    if (displayOnHomepage !== undefined) schedule.displayOnHomepage = displayOnHomepage;

    schedule.lastUpdatedBy = req.user._id;
    await schedule.save();

    res.json({ message: 'Calendrier mis à jour avec succès', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteCollecteSchedule = async (req, res) => {
  try {
    const schedule = await CollecteSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Calendrier introuvable' });
    res.json({ message: 'Calendrier supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// MEDIA MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────

exports.getMediaLibrary = async (req, res) => {
  try {
    const { category, isActive, tags } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (tags) filter.tags = { $in: tags.split(',') };

    const media = await Media.find(filter).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Média introuvable' });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const { alt, title, category, tags, description, isFeatured } = req.body;

    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Média introuvable' });

    if (alt !== undefined) media.alt = alt;
    if (title !== undefined) media.title = title;
    if (category !== undefined) media.category = category;
    if (tags !== undefined) media.tags = tags;
    if (description !== undefined) media.description = description;
    if (isFeatured !== undefined) media.isFeatured = isFeatured;

    await media.save();

    res.json({ message: 'Média mis à jour avec succès', media });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: 'Média introuvable' });

    // Delete file from disk if needed
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '..', media.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Erreur lors de la suppression du fichier:', e.message);
      }
    }

    res.json({ message: 'Média supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = exports;
