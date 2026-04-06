const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Farmer = require('../models/Farmer');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Login karo pehle'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try Farmer first (primary auth system), then fall back to User
    let user = await Farmer.findById(decoded.id).select('-password');
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User nahi mila, login karo'
      });
    }

    req.user = user;
    return next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token galat hai, login karo'
    });
  }
};

module.exports = { protect };