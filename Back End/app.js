const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const userRoutes = require('./routes/user');

app.use(cors());
app.use(bodyParser.json());

app.use('/user',userRoutes);

app.listen(3000);