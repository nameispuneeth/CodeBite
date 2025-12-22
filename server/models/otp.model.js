const mongoose=require("mongoose");
const OTP=new mongoose.Schema({
    email:{type:String,unique:true},
    otp:{type:String},
    expiry:{type:Date},
},{collection:"OTP"});

const OTPModel=mongoose.model("OTP",OTP);
module.exports=OTPModel;
