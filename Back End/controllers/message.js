const Message = require("../models/messages");
let User = require("../models/users");
const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 

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

module.exports = { sendMsg, fetchMessageByLastMsgId, fetchOlderMessages };
