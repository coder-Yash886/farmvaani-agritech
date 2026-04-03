const express = require('express');
const router = express.Router();
const { getAdvice, getHistory } = require('../controllers/advisoryController');

router.post('/ask', getAdvice);
router.get('/history/:phone', getHistory);

module.exports = router;