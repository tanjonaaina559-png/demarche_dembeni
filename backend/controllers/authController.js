const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Register Citizen
const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, phone, CIN, address, dateNaissance } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const user = await User.create({
      firstname,
      lastname,
      email,
      phone,
      CIN,
      address,
      dateNaissance,
      password,
      role: 'citizen',
      status: 'pending' // pending by default for citizens
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        status: user.status,
        role: user.role,
        message: 'Inscription réussie. Votre compte est en attente de validation.'
      });
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Logic for status
      if (user.role === 'citizen') {
        if (user.status === 'pending') {
          return res.status(401).json({ message: "Votre compte est en attente de validation par l'administration." });
        }
        if (user.status === 'rejected') {
          return res.status(401).json({ message: "Votre compte a été refusé. Veuillez contacter l'administration." });
        }
      }

      res.json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        status: user.status,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile by token
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      CIN: user.CIN,
      address: user.address,
      dateNaissance: user.dateNaissance,
      status: user.status,
      role: user.role,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `Bonjour,\n\nCliquez sur le lien suivant pour modifier votre mot de passe :\n\n${resetUrl}\n\nCe lien expire dans 1 heure.\n\nCommune de Dembéni.`;

    try {
      await emailService.sendEmail({
        email: user.email,
        subject: 'Réinitialisation du mot de passe',
        message
      });

      res.json({ message: 'Un lien de réinitialisation a été envoyé.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "L'e-mail n'a pas pu être envoyé" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword };
