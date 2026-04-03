const { getWeather } = require('./weatherService');
const { getAdvisory } = require('./claudeService');
const Alert = require('../models/Alert');
const Farmer = require('../models/Farmer');

const generateAlerts = async (farmerId) => {
  try {
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) throw new Error('Farmer nahi mila');

    const weather = await getWeather(
      farmer.location.lat,
      farmer.location.lon
    );

    const alerts = [];

    // Temperature alert
    if (weather.temperature > 40) {
      alerts.push({
        farmer: farmerId,
        type: 'weather',
        message: `Bahut zyada garmi hai - ${weather.temperature}°C. Fasal ko paani do.`,
        severity: 'high'
      });
    } else if (weather.temperature < 5) {
      alerts.push({
        farmer: farmerId,
        type: 'weather',
        message: `Bahut thandi hai - ${weather.temperature}°C. Fasal ko bachao.`,
        severity: 'high'
      });
    }

    // Humidity alert
    if (weather.humidity > 85) {
      alerts.push({
        farmer: farmerId,
        type: 'pest',
        message: `Humidity ${weather.humidity}% hai. Fungal disease ka khatre hai.`,
        severity: 'medium'
      });
    }

    // Rain alert
    if (weather.rainfall > 0) {
      alerts.push({
        farmer: farmerId,
        type: 'weather',
        message: `Barish ho rahi hai - ${weather.rainfall}mm. Khet mein paani na do.`,
        severity: 'low'
      });
    }

    // Database mein save karo
    if (alerts.length > 0) {
      await Alert.insertMany(alerts);
    }

    return { weather, alerts };

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { generateAlerts };