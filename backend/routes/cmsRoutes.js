const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const cmsController = require('../controllers/cmsController');
const homepageCmsController = require('../controllers/homepageCmsController');
const { uploadMedia, bulkUploadMedia, deleteMediaFile } = require('../controllers/mediaController');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// All routes below require authentication + admin role
router.use(protect, admin);

// ────────────────────────────────────────────────────────────────────────────
// SETTINGS MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/settings')
  .get(cmsController.getSettings)
  .put(cmsController.updateSettings);

// ────────────────────────────────────────────────────────────────────────────
// HERO SECTION MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/hero')
  .get(cmsController.getHeroSection)
  .put(cmsController.updateHeroSection);

// ────────────────────────────────────────────────────────────────────────────
// FAQ MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/faqs')
  .get(cmsController.getAllFAQs)
  .post(cmsController.createFAQ);

router.route('/faqs/:id')
  .get(cmsController.getFAQ)
  .put(cmsController.updateFAQ)
  .delete(cmsController.deleteFAQ);

// ────────────────────────────────────────────────────────────────────────────
// COLLECTE SCHEDULE MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/collecte-schedules')
  .get(cmsController.getCollecteSchedules)
  .post(cmsController.createCollecteSchedule);

router.route('/collecte-schedules/:id')
  .get(cmsController.getCollecteSchedule)
  .put(cmsController.updateCollecteSchedule)
  .delete(cmsController.deleteCollecteSchedule);

// ────────────────────────────────────────────────────────────────────────────
// SERVICE PUBLIC SECTION MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/service-public')
  .get(homepageCmsController.getServicePublic)
  .put(homepageCmsController.updateServicePublic);

// ────────────────────────────────────────────────────────────────────────────
// LOISIRS SECTION MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/loisirs')
  .get(homepageCmsController.getLoisirs)
  .put(homepageCmsController.updateLoisirs);

// ────────────────────────────────────────────────────────────────────────────
// PASSPORT SECTION MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/passport')
  .get(homepageCmsController.getPassport)
  .put(homepageCmsController.updatePassport);

// ────────────────────────────────────────────────────────────────────────────
// FOOTER SETTINGS MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────
router.route('/footer')
  .get(homepageCmsController.getFooter)
  .put(homepageCmsController.updateFooter);

// ────────────────────────────────────────────────────────────────────────────
// MEDIA MANAGEMENT (with file upload)
// ────────────────────────────────────────────────────────────────────────────
router.route('/media')
  .get(cmsController.getMediaLibrary)
  .post(cloudinaryUpload.single('file'), uploadMedia);

router.route('/media/bulk')
  .post(cloudinaryUpload.array('files', 10), bulkUploadMedia);

router.route('/media/:id')
  .get(cmsController.getMedia)
  .put(cmsController.updateMedia)
  .delete(deleteMediaFile);

module.exports = router;
