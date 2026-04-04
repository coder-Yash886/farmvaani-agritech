const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { authenticate } = require('../middleware/farmerAuth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/send', sendMessage);
router.get('/:groupId', getMessages);

module.exports = router;