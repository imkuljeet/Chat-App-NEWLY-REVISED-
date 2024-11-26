const multer = require("multer");
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });

const AWS = require('aws-sdk');
const Message = require("../models/messages");
const User = require("../models/users");
const UserGroup = require("../models/usergroup");
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET,
  // region: 'us-east-1' // Adjust this to your AWS region
});

const s3 = new AWS.S3();

const sendMsg = async (req, res, next) => {
  try {
    const { message, groupId } = req.body;

    if (!message && !req.file) {
      return res.status(400).json({ success: false, error: "Message or file is required" });
    }

    let fileUrl = null;
    if (req.file) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${Date.now()}_${req.file.originalname}`, // Unique file name
        Body: req.file.buffer // Use buffer directly from multer
        ,ACL : 'public-read'
      };

      // Uploading files to the bucket
      const s3Upload = await s3.upload(params).promise();
      fileUrl = s3Upload.Location;
    }

    console.log("MESSAGE", message);
    const createdMessage = await Message.create({
      message,
      fileUrl,
      userId: req.user.id,
      groupId
    });

    res.status(201).json({ success: true, message: "Message sent successfully", data: createdMessage });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const fetchMessageByLastMsgId = async (req, res) => {
    try {
      const lastMsgId = parseInt(req.query.lastmsgid, 10) || 0;
      const newMessages = await getMessages(lastMsgId);

      console.log("NEW MESSAGES >>>>",newMessages);
      res.status(200).json({ messages: newMessages });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching messages" });
    }
  }
;
async function getMessages(lastMsgId) {
  const query = lastMsgId ? { id: { [Sequelize.Op.gt]: lastMsgId } } : {};
  const newMessages = await Message.findAll({
    where: query,
    include: [{ model: User, attributes: ["name"] }],
    order: [["id", "ASC"]],
  });
  return newMessages;
}


const fetchOlderMessages = async (req, res) => {
  try {
    const { firstmsgid } = req.query;
    const messages = await Message.findAll({
      where: {
        id: {
          [Op.lt]: firstmsgid // Fetch messages with id less than the firstmsgid
        }
      },
      include: [{ model: User, attributes: ["name"] }],
      order: [['id', 'ASC']], // Sort by id in descending order
      limit: 20 // You can adjust the limit based on your requirements
    });

    console.log("OLDMESSAGES>>>",messages);

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching older messages:', error);
    res.status(500).json({ error: 'Failed to fetch older messages' });
  }
};

const getAllGroupMsgs = async (req,res,next) =>{
    const { groupId } = req.params;
    const userId = req.user.id; // Assuming you have middleware that sets req.user.id
  
    try {
      // Check if the user belongs to the group
      const userGroup = await UserGroup.findOne({ where: { userId, groupId } });
      if (!userGroup) {
        return res.status(403).json({ error: "User does not belong to the group" });
      }
  
      // Fetch messages for the group
      const messages = await Message.findAll({ where: { groupId }, include: ['user'] });
      res.status(200).json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { sendMsg, fetchMessageByLastMsgId, fetchOlderMessages, getAllGroupMsgs};
