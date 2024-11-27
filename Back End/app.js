const express = require("express");
const cors = require("cors");
require('dotenv').config();

const bodyParser = require("body-parser");
const cron = require('node-cron'); // Import node-cron
const sequelize = require("./util/database");
const Sequelize = require("sequelize");

const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" }
});

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");
const adminRoutes = require("./routes/admin");

const User = require("./models/users");
const Message = require("./models/messages");
const Group = require("./models/groups");
const UserGroup = require("./models/usergroup");
const ArchivedChat = require("./models/archivedchat"); // Import ArchivedChat model

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);
app.use("/admin", adminRoutes);

User.hasMany(Message, { foreignKey: "userId" });
Message.belongsTo(User, { foreignKey: "userId" });

User.belongsToMany(Group, { through: UserGroup, foreignKey: "userId" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "groupId" });

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });

UserGroup.belongsTo(User, { foreignKey: "userId" });
UserGroup.belongsTo(Group, { foreignKey: "groupId" });
User.hasMany(UserGroup, { foreignKey: "userId" });
Group.hasMany(UserGroup, { foreignKey: "groupId" });

// Cron job to move and delete messages older than 1 day
cron.schedule('0 0 * * *', async () => {
  try {
    const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find messages older than 1 day
    const oldMessages = await Message.findAll({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: oneDayAgo
        }
      }
    });

    // Archive the old messages
    const archivedMessages = oldMessages.map(msg => ({
      message: msg.message,
      fileUrl: msg.fileUrl,
      userId: msg.userId,
      groupId: msg.groupId,
      createdAt: msg.createdAt
    }));
    await ArchivedChat.bulkCreate(archivedMessages);

    // Delete the old messages
    await Message.destroy({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: oneDayAgo
        }
      }
    });

    console.log(`Archived and deleted ${oldMessages.length} messages`);
  } catch (err) {
    console.error('Error archiving messages:', err);
  }
});


sequelize
  .sync()
  .then(() => {
    server.listen(process.env.PORT);

    io.on('connection', (socket) => {
      console.log("user connected");

      socket.on('send-message', (msg, id) => {
        console.log("groupid : ", id);
        console.log("Received message : ", msg);

        io.emit('recdMsg', id);
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
