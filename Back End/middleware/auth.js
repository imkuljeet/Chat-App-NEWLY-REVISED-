const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authenticate = async (req,res,next) =>{
    try{
    const token = req.header("Authorization");
    // console.log("TOKEN>>>>",token);

    const userInToken = jwt.verify(token,'secretkey');

    // console.log("USER>>>",userInToken);

    const user = await User.findOne({ where :{ id : userInToken.userId}});
    // console.log("USER>>>",user);
    req.user = user;

    next();
    } catch(err){
        console.log(err);
        return res.status(401).json({ success : false , message : 'Authentication error'});
    }
}

module.exports = { authenticate };