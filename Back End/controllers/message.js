const Message = require("../models/messages");
let User = require("../models/users");
const Sequelize = require('sequelize');

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

// const fetchAll = async (req, res, next) => {
//   try {
//     // let messages = await Message.findAll();
//     let messages = await Message.findAll({
//       include: [{ model: User, attributes: ["name"] }],
//     });
//     res.status(200).json({ success: true, messages });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// };

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

module.exports = { sendMsg, fetchMessageByLastMsgId };
