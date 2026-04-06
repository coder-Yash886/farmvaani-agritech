const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId:      { type: String, required: true },
  senderName:  { type: String, required: true },
  senderPhone: { type: String, required: true },
  text:        { type: String, default: '' },
  audioUrl:    { type: String, default: '' },
  imageUrl:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
