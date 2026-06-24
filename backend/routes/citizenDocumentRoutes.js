const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/citizenDocumentController');

router.use(protect);

router.get('/my-documents', ctrl.getMyDocuments);
router.post('/',            ctrl.createDocument);
router.put('/:id',          ctrl.updateDocument);
router.delete('/:id',       ctrl.deleteDocument);
router.get('/pdf/:id',      ctrl.downloadDocument);

module.exports = router;
