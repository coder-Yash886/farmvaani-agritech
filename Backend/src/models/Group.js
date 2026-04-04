const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add creator to members automatically
groupSchema.pre('save', function(next) {
  if (this.isNew && !this.members.includes(this.createdBy)) {
    this.members.push(this.createdBy);
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);