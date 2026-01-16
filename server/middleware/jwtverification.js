const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretcode = process.env.secretCode;

const verification=async (req,res,next)=>{
    const token = req.headers['authorization'];
    if(!token) return next();
    try{
        const data = jwt.verify(token, secretcode);
        req.user=data;
        next();
    }
    catch(e){
        res.send({status:'error',error:"Authentication Failed"});
    }
}
module.exports=verification;