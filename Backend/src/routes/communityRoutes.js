const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMessages, uploadAudio, uploadImage, createGroup, getGroupsByDistrict, searchGroups } = require('../controllers/communityController');

const uploadsDir = path.join(__dirname, '../../uploads');

// ── Audio storage ────────────────────────────────────────────────────────────
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'audio-' + suffix + '.webm');
  }
});
const uploadAudioMiddleware = multer({
  storage: audioStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Image storage ────────────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/heic', 'image/heif', 'image/bmp',
  'image/svg+xml', 'image/tiff'
];

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Derive extension from mime or original name
    const extMap = {
      'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
      'image/gif': '.gif', 'image/webp': '.webp', 'image/heic': '.heic',
      'image/heif': '.heif', 'image/bmp': '.bmp', 'image/svg+xml': '.svg',
      'image/tiff': '.tiff'
    };
    const ext = extMap[file.mimetype] || path.extname(file.originalname) || '.jpg';
    cb(null, 'img-' + suffix + ext);
  }
});
const uploadImageMiddleware = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const isAllowed = ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
      file.mimetype.startsWith('image/');
    if (isAllowed) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}. Please send an image.`));
  }
});

// Wrap multer to return JSON errors instead of HTML
const handleImageUpload = (req, res, next) => {
  uploadImageMiddleware.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    next();
  });
};

const handleAudioUpload = (req, res, next) => {
  uploadAudioMiddleware.single('audio')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Audio upload failed' });
    }
    next();
  });
};

// ── Routes ───────────────────────────────────────────────────────────────────
router.get('/messages/:roomId', getMessages);
router.post('/upload-audio', handleAudioUpload, uploadAudio);
router.post('/upload-image', handleImageUpload, uploadImage);
router.post('/groups', createGroup);
router.get('/groups/search', searchGroups);
router.get('/groups/:district', getGroupsByDistrict);

module.exports = router;
