const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Token generate karo
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Signup
const signup = async (req, res) => {
  try {
    const { name, phone, password, village, lat, lon, crops } = req.body;

    // Check karo user pehle se hai ya nahi
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Is number se account pehle se hai'
      });
    }

    // Password hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User banao
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      village,
      location: { lat, lon },
      crops
    });

    // Token banao
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account ban gaya!',
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        village: user.village,
        crops: user.crops,
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // User dhundo
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Phone number galat hai'
      });
    }

    // Password check karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password galat hai'
      });
    }

    // Token banao
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login ho gaya!',
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        village: user.village,
        crops: user.crops,
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Profile dekho
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Password change karo
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Purana password check karo
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Purana password galat hai'
      });
    }

    // Naya password hash karo
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password badal gaya!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { signup, login, getProfile, changePassword };