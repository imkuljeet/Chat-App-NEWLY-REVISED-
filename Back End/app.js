const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const app = express();

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require("./routes/group");

const User = require("./models/users");
const Message = require("./models/messages");
const Group = require("./models/groups");
const UserGroup = require("./models/usergroup");

app.use(cors());
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);

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
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
