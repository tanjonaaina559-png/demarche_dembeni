const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');
const cloudinaryCitizenUpload = require('../middleware/cloudinaryCitizenUpload');

// Public verification route
router.get('/verify/:reference', requestController.verifyDocument);

// Citizen routes
router.post('/', protect, cloudinaryCitizenUpload.array('documents', 5), requestController.createRequest);
router.get('/my-requests', protect, requestController.getCitizenRequests);
router.get('/my-documents', protect, requestController.getCitizenDocuments);
router.get('/:id/receipt', protect, requestController.downloadReceipt);
router.get('/:id/official', protect, requestController.downloadOfficial);
// Keep legacy route for fallback if needed during transition
router.get('/:id/pdf', protect, requestController.downloadLegacyPdf);

// Admin routes
router.get('/', protect, admin, requestController.getAllRequests);
router.put('/:id/status', protect, admin, requestController.updateRequestStatus);

module.exports = router;
