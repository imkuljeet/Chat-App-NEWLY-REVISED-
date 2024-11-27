const express = require("express");
const router = express.Router();
const multer = require("multer");

const messageController = require("../controllers/message");
const Authorization = require("../middleware/auth");

// Set up multer for file uploads with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to send messages, with file upload support
router.post("/send", Authorization.authenticate, upload.single('file'), messageController.sendMsg);
router.get('/getGroupMessages/:groupId', Authorization.authenticate, messageController.getAllGroupMsgs);

module.exports = router;
