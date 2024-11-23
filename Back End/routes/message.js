const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message');
const Authorization = require('../middleware/auth');

router.post('/send',Authorization.authenticate,messageController.sendMsg);


module.exports = router;