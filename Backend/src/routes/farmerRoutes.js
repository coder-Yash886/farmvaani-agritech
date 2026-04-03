const express = require('express');
const router = express.Router();
const { registerFarmer, getFarmer, loginFarmer } = require('../controllers/farmerController');

router.post('/register', registerFarmer);
router.post('/login', loginFarmer);
router.get('/:phone', getFarmer);

module.exports = router;