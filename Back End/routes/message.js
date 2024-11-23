const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message");
const Authorization = require("../middleware/auth");

router.post("/send", Authorization.authenticate, messageController.sendMsg);
// router.get(
//   "/fetchMessages",
//   Authorization.authenticate,
//   messageController.fetchAll
// );

router.get("/fetchMessages", Authorization.authenticate ,messageController.fetchMessageByLastMsgId);
router.get('/fetchOlderMessages', Authorization.authenticate ,messageController.fetchOlderMessages);
router.get('/getGroupMessages/:groupId', Authorization.authenticate, messageController.getAllGroupMsgs);

module.exports = router;
