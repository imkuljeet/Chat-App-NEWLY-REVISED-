const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const User = require('../models/users');
const ForgotPassword = require('../models/forgotpassword');

const forgotpassword = async (req,res,next)=>{
    try{
    
    const email = req.body.email;

    const user = await User.findOne({ where : { email }});

    if(user){
        const id = uuid.v4();

        console.log("ID>>>",id)

        
        ForgotPassword.create({ id, userId: user.id, active: true }).catch((err)=>{
            throw new Error(err);
        })

        const transporter = nodemailer.createTransport({
            host : process.env.SMTP_HOST,
            port : process.env.SMTP_PORT,
    
            auth : {
                user : process.env.SMTP_EMAIL,
                pass : process.env.SMTP_PASSWORD
            }
        })
    
        const mailOptions = {
            from : process.env.SMTP_EMAIL,
            to : email,
            subject : "DUMMY MAIL",
            text : 'Its a dummy mail for you',
            html : `<h1>Click on the link below to reset the Password.</h1><a href="http://localhost:3000/password/resetpassword/${id}">Reset Password </a>`
        };
    
        
            const result = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully!!")
            res.status(200).json({ message : 'Email sent successfully', success : true })
    
    }

}
    catch(err){
        console.log(err);
        res.status(500).json({ success : false, err : 'Failed to send email' });
    }

}

const resetpassword = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("PARAMS ID is", id);
        console.log("I AM INSIDE RESET PASSWORD");
        const forgotpasswordrequest = await ForgotPassword.findOne({ where: { id } });

        if (forgotpasswordrequest) {
            await forgotpasswordrequest.update({ active: false });

            res.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
  </head>
  <body>
    <form action="${process.env.WEBSITE}/password/updatepassword/${id}" method="get">
      <label for="newpassword">Enter New Password : </label>
      <input type="password" name="newpassword" id="newpassword" required />
      <button type="submit">Reset Password</button>
    </form>
    <script>
      function formsubmitted(e) {
        e.preventDefault();
        console.log("Called");
      }
    </script>
  </body>
</html>`);
            res.end();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

const updatepassword = async (req,res) =>{
    try{
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        let resetpassrequest = await ForgotPassword.findOne({ where : { id : resetpasswordid }});
        let user = await User.findOne({ where : { id : resetpassrequest.userId }});

        if (user){
            const saltrounds = 10;

            bcrypt.genSalt(saltrounds, function(err,salt){
                if(err){
                    console.log(err);
                    throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, function(err,hash){
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                    user.update({ password : hash }).then(()=>{
                        res.status(201).json({ message : "Successfully updated the new Password"});
                    })
                })
            })
        }else{
            res.status(404).json({ success:false, error :"No User exists"});
        }


    }catch(err){
        console.log(err);
    }
}

module.exports = {
    forgotpassword,
    resetpassword,
    updatepassword
}