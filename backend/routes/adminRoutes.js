const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const procedureController = require('../controllers/procedureController');
const demarchesController = require('../controllers/demarches.controller');
const procedureUpload = require('../middleware/procedureUpload');

// Toutes les routes ci-dessous nécessitent authentification + rôle admin
router.use(protect, admin);

// ── Citoyens ─────────────────────────────────────────────────────────────────
router.route('/citizens')
  .get(adminController.getCitizens);

router.route('/citizens/:id')
  .put(adminController.updateCitizen)
  .delete(adminController.deleteCitizen);

router.put('/citizens/:id/validate',  adminController.validateCitizen);
router.put('/citizens/:id/reject',    adminController.rejectCitizen);
router.put('/citizens/:id/suspend',   adminController.suspendCitizen);
router.put('/citizens/:id/activate',  adminController.activateCitizen);

// ── Procédures (CRUD complet + upload image) ──────────────────────────────────
router.route('/procedures')
  .get(procedureController.getAllProcedures)
  .post(procedureUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }]), procedureController.createProcedure);

router.route('/procedures/:id')
  .put(procedureUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'backgroundImage', maxCount: 1 }]), procedureController.updateProcedure)
  .delete(procedureController.deleteProcedure);

// Toggle actif/inactif
router.put('/procedures/:id/toggle', procedureController.toggleProcedureActive);

// ── Requests (Requests) ───────────────────────────────────────────────────────
router.get('/requests',                  demarchesController.getAllRequests);
router.put('/requests/:id/status',       demarchesController.updateRequestStatus);
router.delete('/requests/:id',           demarchesController.deleteRequest);

// ── Statistiques ─────────────────────────────────────────────────────────────
router.get('/stats',       adminController.getStats);
router.get('/statistics',  adminController.getFullStats);

module.exports = router;
