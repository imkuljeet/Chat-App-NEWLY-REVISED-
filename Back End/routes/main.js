const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.sendFile('home.html',{ root : 'views'});
})
router.get('/login',(req,res,next)=>{
    res.sendFile('login.html',{ root : 'views'});
})

router.get('/signup',(req,res,next)=>{
    res.sendFile('signup.html',{ root : 'views'});
})

router.get('/chat',(req,res,next)=>{
    res.sendFile('chat.html',{ root : 'views'});
})

router.get('/addMembers',(req,res,next)=>{
    res.sendFile('addMembers.html',{ root : 'views'});
})

router.get('/nameGroup',(req,res,next)=>{
    res.sendFile('nameGroup.html',{ root : 'views'});
})




module.exports = router;