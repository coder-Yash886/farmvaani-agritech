const express = require('express');
const { createGroup, getGroups, joinGroup, leaveGroup } = require('../controllers/groupController');
const { authenticate } = require('../middleware/farmerAuth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/create', createGroup);
router.get('/', getGroups);
router.post('/:groupId/join', joinGroup);
router.post('/:groupId/leave', leaveGroup);

module.exports = router;