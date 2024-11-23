const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const app = express();

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const groupRoutes = require('./routes/group');

const User = require('./models/users');
const Message = require('./models/messages');
const Group = require('./models/groups');
const UserGroup = require('./models/usergroup');

app.use(cors());
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/message",messageRoutes);
app.use('/group',groupRoutes);

User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Group, { through: UserGroup }); 
Group.belongsToMany(User, { through: UserGroup });

sequelize
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
