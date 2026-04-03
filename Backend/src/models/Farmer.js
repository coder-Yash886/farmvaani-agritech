const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  village: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lon: Number
  },
  crops: [String],
  language: {
    type: String,
    default: 'hi'
  }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);