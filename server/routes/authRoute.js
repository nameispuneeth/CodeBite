const express = require('express');
const router = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const OTPModel = require("../models/otp.model")
const secretcode = process.env.secretCode;
const jwt=require("jsonwebtoken")


let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.gmail,
        pass: process.env.password
    }
});


router.post('/login', async (req, res) => {
    let data = req.body;
    try {
        const user = await User.findOne({ email: data.email });
        if (user) {
            let PassComp = await bcrypt.compare(data.pwd, user.password);
            if (PassComp) {
                const token = jwt.sign({
                    name: user.name,
                    email: user.email
                }, secretcode);
                res.json({ status: 'ok', token });
            }
            else {
                res.json({ status: 'error', error: 'Invalid Credientials' })
            }
        } else {
            res.json({ status: 'error', error: 'Email Doesnt Exist' })
        }
    }
    catch {
        res.json({ status: 'error', error: 'Network Issues' })

    }
})


router.post('/register', async (req, res) => {
    let data = req.body;
    try {
        const temp = await User.findOne({ email: data.email });
        if (temp) {
            res.json({ status: 'error', error: 'Email In Use' });
        } else {
            const newPassword = await bcrypt.hash(data.pwd, 10);
            const OTP = Math.floor(100000 + Math.random() * 900000);
            const hashedOTP = await bcrypt.hash(OTP.toString(), 10);
            const abc=await OTPModel.findOneAndUpdate(
                { email: data.email },
                {
                    otp: hashedOTP,
                    expiry: new Date(Date.now() + 1000 * 60 * 5)
                },
                { upsert: true, new: true }
            );
            
            const token = jwt.sign({ email: data.email,password: newPassword,name: data.name,}, secretcode ,{expiresIn:'5m'});
            let mailOptions = {
                from: `"Codebite IDE" <${process.env.gmail}>`,
                to: data.email,
                subject: 'Your Email Verification Code for Register',
                html: `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h3><b>Hello There,</h3>
    <h4>Your verification code is:</h4> <h1>${OTP}</h1>
      <h5>Please use this code within 5 minutes</span>.</h5>
      <br/>
      <p>Best regards,<br/><b>Codebite IDE Team</b></p>
    </div>
  `
            };

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    res.send({ status: 'error', error: 'NETWORK ISSUES' })
                } else {
                    res.send({ status: 'ok', authToken: token });
                }
            });

        }
    }
    catch {
        res.json({ status: 'error', error: 'Network Issues' });
    }

})


router.post("/sendmailforpwdchange", async (req, res) => {
    const data = req.body;
    const result = await User.findOne({ email: data.email });
    if (result) {
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const hashedOTP = await bcrypt.hash(OTP.toString(), 10);
        await OTPModel.findOneAndUpdate(
            { email: data.email },
            {
                otp: hashedOTP,
                expiry: Date.now() + (1000 * 60 * 5)
            }, {
            upsert: true
        });
        const token = jwt.sign({ email: data.email }, secretcode,{expiresIn:'5m'});

        let mailOptions = {
            from: `"Codebite IDE" <${process.env.gmail}>`,
            to: data.email,
            subject: 'Your Email Verification Code for PassWord Change',
            html: `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h3><b>Hello There,</h3>
    <h4>Your verification code is:</h4> <h1>${OTP}</h1>
      <h5>Please use this code within 5 minutes</span>.</h5>
      <br/>
      <p>Best regards,<br/><b>Codebite IDE Team</b></p>
    </div>
  `
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                res.send({ status: 'error', error: 'NETWORK ISSUES' })
            } else {
                res.send({ status: 'ok', authToken: token });

            }
        });
    }
    else res.send({ status: 'error', error: 'No Email Exists' });
})

router.post("/changepwd", async (req, res) => {
    const token = req.headers['authorization'];
    const newPWD = req.body.pwd1;
    try {
        const data = jwt.verify(token, secretcode);
        const newPassword = await bcrypt.hash(newPWD, 10);
        const updationres = await User.updateOne({ email: data.email }, { $set: { password: newPassword } });
        res.send({ status: 'ok' });

    } catch {
        res.send({ status: 'error', error: 'Session Expired' });
    }
})
router.get("/registerUser", async (req, res) => {
    const token = req.headers['authorization'];
    try {
        const data = jwt.verify(token, secretcode);
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: data.password,
        })
        res.send({ status: 'ok' });
    } catch {
        res.send({ status: 'error', error: 'Network Issues' })
    }
})


router.post("/verifyotp",async(req,res)=>{
    const token=req.headers.authorization;
    const OTP=req.body.otp.toString();
    
    try{
        const decoded=jwt.verify(token,secretcode);
        const userOTP=await OTPModel.findOne({email:decoded.email});
        if(!userOTP) return res.send({status:'error',error:'Server Error'})
        if(Date.now()>userOTP.expiry || !OTP || !userOTP) return res.send({status:'error',error:"OTP Expired"});
        const match=await bcrypt.compare(OTP,userOTP.otp);
        const newtoken=jwt.sign({email:decoded.email,name:decoded.name,password:decoded.password},secretcode);
        if(!match) return res.send({status:'error',error:"Verification Failed"});
        return res.send({status:'ok',token:newtoken}) 
    }catch(e){
        res.send({status:'error',error:'Session Expired'})
    }
})

module.exports=router;

