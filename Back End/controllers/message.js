const sendMsg = async(req,res,next)=>{
    const { message } = req.body;

    console.log("MESSAGE ",message);
};

module.exports = { sendMsg };