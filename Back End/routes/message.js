const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message');

router.post('/send',messageController.sendMsg);


module.exports = router;