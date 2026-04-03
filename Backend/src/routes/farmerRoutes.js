const express = require('express');
const router = express.Router();
const { registerFarmer, getFarmer } = require('../controllers/farmerController');

router.post('/register', registerFarmer);
router.get('/:phone', getFarmer);

module.exports = router;