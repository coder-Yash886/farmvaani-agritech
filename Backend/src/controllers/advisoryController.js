const { getWeather } = require('../services/weatherService');
const { getAdvisory } = require('../services/claudeService');
const Query = require('../models/Query');
const Farmer = require('../models/Farmer');

const getAdvice = async (req, res) => {
  try {
    const { phone, crop, question, imageBase64 } = req.body;

    if (!crop || !question) {
      return res.status(400).json({
        success: false,
        message: 'Crop aur question dono chahiye'
      });
    }

    // Farmer dhundo
    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer registered nahi hai'
      });
    }

    // Weather lo farmer ki location se
    const weather = await getWeather(
      farmer.location.lat,
      farmer.location.lon
    );

    // Claude se advice lo
    const answer = await getAdvisory(crop, weather, question, imageBase64);

    // Database mein save karo
    const query = await Query.create({
      farmer: farmer._id,
      question,
      crop,
      answer,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        description: weather.description
      }
    });

    res.json({
      success: true,
      data: {
        question,
        crop,
        weather,
        answer,
        savedAt: query.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Farmer ki purani queries lo
const getHistory = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ phone: req.params.phone });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer nahi mila'
      });
    }

    const queries = await Query.find({ farmer: farmer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: queries });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAdvice, getHistory };