const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message');
const Authorization = require('../middleware/auth');

router.post('/send',Authorization.authenticate,messageController.sendMsg);
router.get('/fetchMessages',Authorization.authenticate,messageController.fetchAll);


module.exports = router;