const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

const authenticate = async (req, res, next) => {
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

    const farmer = await Farmer.findById(decoded.id).select('-password');
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Farmer nahi mila'
      });
    }

    req.farmerId = farmer._id;
    req.farmer = farmer;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = { authenticate };