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
    
    // Security: Never reveal whether an email exists
    if (!user) {
      console.log(`[Forgot Password] User not found for email: ${email}`);
      return res.status(200).json({ message: 'Si cette adresse correspond à un compte, un lien de réinitialisation a été envoyé.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `Bonjour,\n\nCliquez sur le lien suivant pour modifier votre mot de passe :\n\n${resetUrl}\n\nCe lien expire dans 15 minutes.\n\nCommune de Dembéni.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #164022; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Commune de Dembéni</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333333; margin-top: 0;">Réinitialisation de votre mot de passe</h2>
          <p style="color: #555555; line-height: 1.6;">Bonjour,</p>
          <p style="color: #555555; line-height: 1.6;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #16A34A; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
          </div>
          <p style="color: #555555; line-height: 1.6; font-size: 14px;"><em>Ce lien expirera dans 15 minutes pour des raisons de sécurité.</em></p>
          <p style="color: #555555; line-height: 1.6; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="color: #888888; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Commune de Dembéni. Tous droits réservés.</p>
        </div>
      </div>
    `;

    try {
      await emailService.sendEmail({
        email: user.email,
        subject: 'Réinitialisation de votre mot de passe - Commune de Dembéni',
        message,
        html
      });
      
      console.log(`[Forgot Password] Email sent successfully to: ${email}`);
      res.status(200).json({ message: 'Si cette adresse correspond à un compte, un lien de réinitialisation a été envoyé.' });
    } catch (err) {
      console.error(`[Forgot Password] Email sending failure for: ${email}`, err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "L'e-mail n'a pas pu être envoyé" });
    }
  } catch (error) {
    console.error(`[Forgot Password] Error: ${error.message}`);
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
      console.log(`[Reset Password] Invalid or expired token: ${token}`);
      return res.status(400).json({ message: 'Lien invalide ou expiré' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log(`[Reset Password] Password updated successfully for user ID: ${user._id}`);
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    console.error(`[Reset Password] Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword };
