const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/user/signup',(req,res,next)=>{
    console.log(req.body);
});

app.listen(3000);