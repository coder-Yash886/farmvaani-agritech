const Farmer = require('../models/Farmer');

// Naya farmer register karo
const registerFarmer = async (req, res) => {
  try {
    const { name, phone, village, lat, lon, crops } = req.body;

    // Check karo farmer pehle se hai ya nahi
    const existing = await Farmer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Is number se farmer pehle se registered hai' 
      });
    }

    const farmer = await Farmer.create({
      name,
      phone,
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

module.exports = { registerFarmer, getFarmer };