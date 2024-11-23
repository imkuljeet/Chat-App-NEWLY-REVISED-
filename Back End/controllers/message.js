const Message = require('../models/messages');

const sendMsg = async (req, res, next) => {
    try {
        const { message } = req.body;

        console.log("MESSAGE", message);
        await Message.create({ message , userId : req.user.id });

        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = { sendMsg };
