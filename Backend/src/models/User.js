const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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
  role: {
    type: String,
    enum: ['farmer', 'admin'],
    default: 'farmer'
  }
}, { timestamps: true });


userSchema.methods.comparePassword = function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);