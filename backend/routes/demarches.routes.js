const express = require('express');
const router = express.Router();
const demarchesController = require('../controllers/demarches.controller');
const { protect, admin } = require('../middleware/authMiddleware');

// Vérification de l'existence du middleware upload
let upload;
try {
  upload = require('../middleware/upload');
} catch {
  upload = require('../middleware/uploadMiddleware');
}

// ── Routes publiques ─────────────────────────────────────────────────────────
router.get('/demarches', demarchesController.getDemarches);
router.get('/demarches/:id', demarchesController.getDemarcheById);

// ── Admin: CRUD for demarches (mapped to procedureController) ─────────────
const procedureController = require('../controllers/procedureController');
router.post('/demarches', protect, admin, procedureController.createProcedure);
router.put('/demarches/:id', protect, admin, procedureController.updateProcedure);
router.delete('/demarches/:id', protect, admin, procedureController.deleteProcedure);

// ── Stats Admin (DOIT être avant /:id pour éviter conflict de route) ─────────
router.get('/requests/stats', protect, admin, demarchesController.getStats);

// ── Routes citoyens ───────────────────────────────────────────────────────────
router.post('/requests', protect, upload.array('documents', 5), demarchesController.createRequest);
router.get('/requests/user/:id', protect, demarchesController.getUserRequests);

// ── Routes admin ─────────────────────────────────────────────────────────────
router.get('/requests', protect, admin, demarchesController.getAllRequests);
router.put('/requests/:id/status', protect, admin, demarchesController.updateRequestStatus);
router.delete('/requests/:id', protect, admin, demarchesController.deleteRequest);

module.exports = router;
