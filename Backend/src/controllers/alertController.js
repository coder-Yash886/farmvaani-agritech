const { generateAlerts } = require('../services/alertService');
const Alert = require('../models/Alert');
const Farmer = require('../models/Farmer');

// Alerts generate karo
const createAlerts = async (req, res) => {
  try {
    const { phone } = req.body;

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer nahi mila'
      });
    }

    const { weather, alerts } = await generateAlerts(farmer._id);

    res.json({
      success: true,
      data: {
        weather,
        alertsGenerated: alerts.length,
        alerts
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Farmer ke alerts dekho
const getAlerts = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ phone: req.params.phone });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer nahi mila'
      });
    }

    const alerts = await Alert.find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: alerts });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Alert read mark karo
const markRead = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true }
    );

    res.json({ 
      success: true, 
      message: 'Alert read mark ho gaya' 
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { createAlerts, getAlerts, markRead };