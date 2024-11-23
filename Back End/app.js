const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const app = express();

const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");

const User = require('./models/users');
const Message = require('./models/messages');

app.use(cors());
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/message",messageRoutes);

User.hasMany(Message);
Message.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
