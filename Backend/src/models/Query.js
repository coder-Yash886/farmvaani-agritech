const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  },
  question: {
    type: String,
    required: true
  },
  crop: String,
  answer: String,
  weather: {
    temperature: Number,
    humidity: Number,
    description: String
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);