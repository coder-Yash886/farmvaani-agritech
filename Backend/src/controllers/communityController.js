const Message = require('../models/Message');
const Group = require('../models/Group');

// ── Groups ───────────────────────────────────────────────────────────────────
exports.createGroup = async (req, res) => {
  try {
    const { name, district, createdBy } = req.body;
    if (!name || !district)
      return res.status(400).json({ success: false, message: 'Name and district required' });
    const group = await Group.create({ name, district, createdBy });
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create group', error: error.message });
  }
};

exports.getGroupsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const groups = await Group.find({ district }).sort({ createdAt: -1 });
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get groups', error: error.message });
  }
};

exports.searchGroups = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      const groups = await Group.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, data: groups });
    }
    const groups = await Group.find({
      name: { $regex: q.trim(), $options: 'i' }
    }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

// ── Messages ─────────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(60);
    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// ── File Uploads ──────────────────────────────────────────────────────────────
exports.uploadAudio = (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    const audioUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, audioUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Audio upload failed', error: error.message });
  }
};

exports.uploadImage = (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image file provided' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image upload failed', error: error.message });
  }
};
