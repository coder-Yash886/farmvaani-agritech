const express = require('express');
const router = express.Router();
const { createAlerts, getAlerts, markRead } = require('../controllers/alertController');

router.post('/generate', createAlerts);
router.get('/:phone', getAlerts);
router.patch('/read/:id', markRead);

module.exports = router;