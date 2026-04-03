const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  password: {
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

farmerSchema.methods.comparePassword = function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);