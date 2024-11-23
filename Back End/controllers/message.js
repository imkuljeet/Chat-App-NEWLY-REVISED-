const Message = require("../models/messages");
let User = require("../models/users");

const sendMsg = async (req, res, next) => {
  try {
    const { message } = req.body;

    console.log("MESSAGE", message);
    await Message.create({ message, userId: req.user.id });

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const fetchAll = async (req, res, next) => {
  try {
    // let messages = await Message.findAll();
    let messages = await Message.findAll({ include: [{ model: User, attributes: ['name'] }] });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { sendMsg, fetchAll };
