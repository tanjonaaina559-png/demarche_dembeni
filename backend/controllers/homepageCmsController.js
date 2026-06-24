const ServicePublicSection = require('../models/ServicePublicSection');
const LoisirsSection = require('../models/LoisirsSection');
const PassportSection = require('../models/PassportSection');
const FooterSettings = require('../models/FooterSettings');

// ────────────────────────────────────────────────────────────────────────────
// HELPER: get-or-create singleton
// ────────────────────────────────────────────────────────────────────────────
const getOrCreate = async (Model) => {
  let doc = await Model.findOne();
  if (!doc) doc = await Model.create({});
  return doc;
};

// ════════════════════════════════════════════════════════════════════════════
// SERVICE PUBLIC SECTION
// ════════════════════════════════════════════════════════════════════════════

exports.getServicePublic = async (req, res) => {
  try {
    const section = await getOrCreate(ServicePublicSection);
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateServicePublic = async (req, res) => {
  try {
    const { tagText, tagIcon, title, description, image, imageUrl, imageAlt, stats, buttonText, buttonLink, isActive } = req.body;
    const section = await getOrCreate(ServicePublicSection);

    if (tagText !== undefined) section.tagText = tagText;
    if (tagIcon !== undefined) section.tagIcon = tagIcon;
    if (title !== undefined) section.title = title;
    if (description !== undefined) section.description = description;
    if (image !== undefined) section.image = image;
    if (imageUrl !== undefined) section.imageUrl = imageUrl;
    if (imageAlt !== undefined) section.imageAlt = imageAlt;
    if (stats) section.stats = stats;
    if (buttonText !== undefined) section.buttonText = buttonText;
    if (buttonLink !== undefined) section.buttonLink = buttonLink;
    if (isActive !== undefined) section.isActive = isActive;

    section.lastUpdatedBy = req.user._id;
    await section.save();
    res.json({ message: 'Section Service Public mise à jour', section });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// LOISIRS SECTION
// ════════════════════════════════════════════════════════════════════════════

exports.getLoisirs = async (req, res) => {
  try {
    const section = await getOrCreate(LoisirsSection);
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateLoisirs = async (req, res) => {
  try {
    const { tagText, tagIcon, title, activitiesTitle, activities, pricingTitle, pricingNote, tarifs, buttonText, buttonLink, isActive } = req.body;
    const section = await getOrCreate(LoisirsSection);

    if (tagText !== undefined) section.tagText = tagText;
    if (tagIcon !== undefined) section.tagIcon = tagIcon;
    if (title !== undefined) section.title = title;
    if (activitiesTitle !== undefined) section.activitiesTitle = activitiesTitle;
    if (activities) section.activities = activities;
    if (pricingTitle !== undefined) section.pricingTitle = pricingTitle;
    if (pricingNote !== undefined) section.pricingNote = pricingNote;
    if (tarifs) section.tarifs = tarifs;
    if (buttonText !== undefined) section.buttonText = buttonText;
    if (buttonLink !== undefined) section.buttonLink = buttonLink;
    if (isActive !== undefined) section.isActive = isActive;

    section.lastUpdatedBy = req.user._id;
    await section.save();
    res.json({ message: 'Section Loisirs mise à jour', section });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PASSPORT SECTION
// ════════════════════════════════════════════════════════════════════════════

exports.getPassport = async (req, res) => {
  try {
    const section = await getOrCreate(PassportSection);
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updatePassport = async (req, res) => {
  try {
    const { tagText, tagIcon, title, steps, buttonText, buttonLink, isActive } = req.body;
    const section = await getOrCreate(PassportSection);

    if (tagText !== undefined) section.tagText = tagText;
    if (tagIcon !== undefined) section.tagIcon = tagIcon;
    if (title !== undefined) section.title = title;
    if (steps) section.steps = steps;
    if (buttonText !== undefined) section.buttonText = buttonText;
    if (buttonLink !== undefined) section.buttonLink = buttonLink;
    if (isActive !== undefined) section.isActive = isActive;

    section.lastUpdatedBy = req.user._id;
    await section.save();
    res.json({ message: 'Section Passeport mise à jour', section });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// FOOTER SETTINGS
// ════════════════════════════════════════════════════════════════════════════

exports.getFooter = async (req, res) => {
  try {
    const footer = await getOrCreate(FooterSettings);
    res.json(footer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

exports.updateFooter = async (req, res) => {
  try {
    const {
      brandName, brandDescription, socialLinks, navigationLinks, servicesLinks,
      address, phone, email, openingHours, copyrightText, legalLinks,
      ctaTitle, ctaDescription, ctaButtons, isActive
    } = req.body;

    const footer = await getOrCreate(FooterSettings);

    if (brandName !== undefined) footer.brandName = brandName;
    if (brandDescription !== undefined) footer.brandDescription = brandDescription;
    if (socialLinks) footer.socialLinks = socialLinks;
    if (navigationLinks) footer.navigationLinks = navigationLinks;
    if (servicesLinks) footer.servicesLinks = servicesLinks;
    if (address !== undefined) footer.address = address;
    if (phone !== undefined) footer.phone = phone;
    if (email !== undefined) footer.email = email;
    if (openingHours !== undefined) footer.openingHours = openingHours;
    if (copyrightText !== undefined) footer.copyrightText = copyrightText;
    if (legalLinks) footer.legalLinks = legalLinks;
    if (ctaTitle !== undefined) footer.ctaTitle = ctaTitle;
    if (ctaDescription !== undefined) footer.ctaDescription = ctaDescription;
    if (ctaButtons) footer.ctaButtons = ctaButtons;
    if (isActive !== undefined) footer.isActive = isActive;

    footer.lastUpdatedBy = req.user._id;
    await footer.save();
    res.json({ message: 'Footer mis à jour', footer });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
