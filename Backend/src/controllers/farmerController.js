const Farmer = require('../models/Farmer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token generate karo
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Naya farmer register karo
const registerFarmer = async (req, res) => {
  try {
    const { name, phone, password, village, lat, lon, crops } = req.body;

    // Check karo farmer pehle se hai ya nahi
    const existing = await Farmer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Is number se farmer pehle se registered hai' 
      });
    }

    // Password hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const farmer = await Farmer.create({
      name,
      phone,
      password: hashedPassword,
      village,
      location: { lat, lon },
      crops
    });

    res.status(201).json({ 
      success: true, 
      message: 'Farmer registered ho gaya!',
      data: farmer 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Farmer ki info lo
const getFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ phone: req.params.phone });
    
    if (!farmer) {
      return res.status(404).json({ 
        success: false,
        message: 'Farmer nahi mila' 
      });
    }

    res.json({ success: true, data: farmer });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Farmer Login
const loginFarmer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return res.status(401).json({ success: false, message: 'Phone number galat hai' });
    }

    const isMatch = await farmer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password galat hai' });
    }

    const token = generateToken(farmer._id);

    res.json({
      success: true,
      message: 'Login ho gaya!',
      data: {
        id: farmer._id,
        name: farmer.name,
        phone: farmer.phone,
        village: farmer.village,
        crops: farmer.crops,
        token
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerFarmer, getFarmer, loginFarmer };