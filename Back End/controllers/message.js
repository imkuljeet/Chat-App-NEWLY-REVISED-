const AWS = require('aws-sdk');
const Message = require("../models/messages");
const UserGroup = require("../models/usergroup");
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

module.exports = { sendMsg, getAllGroupMsgs};
