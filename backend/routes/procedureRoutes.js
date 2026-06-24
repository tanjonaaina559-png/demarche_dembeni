const express = require('express');
const router = express.Router();
const procedureController = require('../controllers/procedureController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', procedureController.getAllProcedures);
router.get('/:id', procedureController.getProcedureDetails);

// Admin routes
router.post('/', protect, admin, procedureController.createProcedure);
router.put('/:id', protect, admin, procedureController.updateProcedure);
router.delete('/:id', protect, admin, procedureController.deleteProcedure);

module.exports = router;
