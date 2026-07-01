const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');
const uploadPdf = require('../middleware/uploadPdfMiddleware');

// Public verification route
router.get('/verify/:reference', requestController.verifyDocument);

// Citizen routes
router.post('/', protect, uploadPdf.array('documents', 5), requestController.createRequest);
router.get('/my-requests', protect, requestController.getCitizenRequests);
router.get('/my-documents', protect, requestController.getCitizenDocuments);
router.get('/:id/pdf', protect, requestController.downloadPdfReceipt);

// Admin routes
router.get('/', protect, admin, requestController.getAllRequests);
router.put('/:id/status', protect, admin, requestController.updateRequestStatus);

module.exports = router;
