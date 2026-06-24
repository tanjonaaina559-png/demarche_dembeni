const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

const protect = verifyToken; // Alias protect as verifyToken

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Non autorisé en tant qu\'administrateur' });
  }
};

const citizenOnly = (req, res, next) => {
  if (req.user && req.user.role === 'citizen') {
    next();
  } else {
    res.status(401).json({ message: 'Non autorisé en tant que citoyen' });
  }
};

// Also export the generic name "admin" as adminOnly, just in case other files use it currently.
const admin = adminOnly;

module.exports = { verifyToken, protect, adminOnly, citizenOnly, admin };
