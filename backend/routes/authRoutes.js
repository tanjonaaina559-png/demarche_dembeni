const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

// Logout — côté backend on marque juste le token comme invalide (stateless JWT)
// La vraie suppression se fait côté frontend (localStorage.removeItem)
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Déconnexion réussie.' });
});

module.exports = router;
