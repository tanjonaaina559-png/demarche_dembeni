const express = require('express');
const router = express.Router();
const publicCmsController = require('../controllers/publicCmsController');

// ────────────────────────────────────────────────────────────────────────────
// PUBLIC CMS ENDPOINTS - NO AUTHENTICATION REQUIRED
// ────────────────────────────────────────────────────────────────────────────

// SETTINGS
router.get('/settings', publicCmsController.getPublicSettings);

// HERO SECTION
router.get('/hero', publicCmsController.getPublicHeroSection);

// FAQ
router.get('/faqs', publicCmsController.getPublicFAQs);
router.get('/faqs/categories', publicCmsController.getPublicFAQCategories);

// COLLECTE SCHEDULE
router.get('/collecte-schedules', publicCmsController.getPublicCollecteSchedules);
router.get('/collecte-schedules/latest', publicCmsController.getLatestCollecteSchedule);

// SERVICE PUBLIC SECTION
router.get('/service-public', publicCmsController.getPublicServicePublic);

// LOISIRS SECTION
router.get('/loisirs', publicCmsController.getPublicLoisirs);

// PASSPORT SECTION
router.get('/passport', publicCmsController.getPublicPassport);

// FOOTER SETTINGS
router.get('/footer', publicCmsController.getPublicFooter);

// PAGES
router.get('/pages', publicCmsController.getPublicPages);
router.get('/pages/:slug', publicCmsController.getPublicPageBySlug);

// SERVICE DESCRIPTIONS
router.get('/services-descriptions', publicCmsController.getPublicServiceDescriptions);
router.get('/services-descriptions/:id', publicCmsController.getPublicServiceDescription);

// MEDIA
router.get('/media', publicCmsController.getPublicMedia);
router.get('/media/:id', publicCmsController.getPublicMediaById);

// COMBO - HOMEPAGE DATA (single API call for all homepage sections)
router.get('/homepage', publicCmsController.getHomepageData);

module.exports = router;
