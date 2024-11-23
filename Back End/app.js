const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors : { origin : "*"}
})

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");
const adminRoutes = require("./routes/admin");

const User = require("./models/users");
const Message = require("./models/messages");
const Group = require("./models/groups");
const UserGroup = require("./models/usergroup");

app.use(cors({ origin : "*"}));
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);
app.use("/admin",adminRoutes);

// User.hasMany(Message);
// Message.belongsTo(User);
User.hasMany(Message, { foreignKey: "userId" });
Message.belongsTo(User, { foreignKey: "userId" });

// User.belongsToMany(Group, { through: UserGroup });
// Group.belongsToMany(User, { through: UserGroup });
User.belongsToMany(Group, { through: UserGroup, foreignKey: "userId" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "groupId" });

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });

UserGroup.belongsTo(User, { foreignKey: "userId" });
UserGroup.belongsTo(Group, { foreignKey: "groupId" });
User.hasMany(UserGroup, { foreignKey: "userId" });
Group.hasMany(UserGroup, { foreignKey: "groupId" });

sequelize
  .sync()
  .then(() => {
    server.listen(3000);

    io.on('connection',(socket)=>{
      console.log("user connected");
      
      socket.on('send-message',(msg,id)=>{
        console.log("groupid : ",id);
        console.log("Received message : ",msg);

        io.emit('recdMsg',id);
      })
      socket.on('disconnect',()=>{
        console.log('user disconnected');
      });
    })
  })
  .catch((err) => {
    console.log(err);
  });
