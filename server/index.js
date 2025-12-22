const express = require('express');
const app = express();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ObjectId } = require("mongoose").Types;
const OTPModel = require("./models/otp.model")

app.use(cors());
app.use(express.json())
const mongoLink = process.env.mongoDbLink;
mongoose.connect(mongoLink).then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch(err => console.error("❌ Connection error:", err));
const genAi = new GoogleGenerativeAI(process.env.apiKey);
const model = genAi.getGenerativeModel({ model: 'gemini-2.5-flash' });

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.gmail,
        pass: process.env.password
    }
});

const secretcode = process.env.secretCode;

app.post('/api/login', async (req, res) => {
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


app.post('/api/register', async (req, res) => {
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

app.post("/api/pushCode", async (req, res) => {
    const token = req.headers['authorization'];

    try {
        const data = jwt.verify(token, secretcode);

        const newCode = {
            _id: new ObjectId(),
            code: req.body.Code,
            date: req.body.Date,
            name: req.body.name,
            extension: req.body.extension
        };

        await User.updateOne(
            { email: data.email },
            { $push: { codes: newCode } }
        );

        res.send({
            status: 'ok',
            code: newCode
        });
    } catch {
        res.send({ status: 'error', error: 'Auth Error' })
    }
})
app.get("/api/getUserData", async (req, res) => {
    const token = req.headers['authorization'];

    try {
        const verify = jwt.verify(token, secretcode);
        const codesData = await User.findOne({ email: verify.email });
        res.send({ status: 'ok', codes: codesData.codes, userName: codesData.name })

    } catch {
        res.send({ status: 'error' })
    }
})

app.post("/api/updateCode", async (req, res) => {
    const token = req.headers['authorization'];
    try {
        const verify = jwt.verify(token, secretcode);

        const result = await User.updateOne(
            { email: verify.email, "codes._id": new ObjectId(req.body._id) },
            {
                $set: {
                    "codes.$.code": req.body.code,
                    "codes.$.name": req.body.name,
                    "codes.$.date": new Date(),
                }
            }
        );

        res.send({ status: "ok" });

    } catch (err) {
        console.error("Update error:", err);
        res.send({ status: 'error' });
    }
});

app.post("/api/updateTitle", async (req, res) => {
    const token = req.headers['authorization'];
    try {
        const verify = jwt.verify(token, secretcode);

        const result = await User.updateOne(
            { email: verify.email, "codes._id": new ObjectId(req.body._id) },
            {
                $set: {
                    "codes.$.name": req.body.title,
                    "codes.$.date": new Date(),
                }
            }
        );

        res.send({ status: "ok" });

    } catch (err) {
        res.send({ status: 'error', error: "Network Issues" });
    }
});

app.post("/api/deleteData", async (req, res) => {
    let token = req.headers['authorization'];

    try {
        const data = jwt.verify(token, secretcode);
        const id = req.body._id;

        const result = await User.updateOne(
            { email: data.email },
            {
                $pull: {
                    codes: {
                        _id: mongoose.Types.ObjectId.isValid(id) ? new ObjectId(id) : id
                    }
                }
            }
        );

        res.send({ status: 'ok' })
    } catch {
        res.send({ status: 'error', error: "Session Time Expired" })
    }
})

app.post('/api/AiData', async (req, res) => {
    
    try {
        const prompt = `
You are a senior ${req.body.Language} developer.

TASK:
${req.body.Prompt}

CODE:
${req.body.Code}

RULES:
- Return ONLY code
- No markdown
- No explanation
`;
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
        res.send({ status: "ok", result: aiResponse });
    }
    catch {
        res.send({ status: 'error', error: "Network Issue" });
    }
})

app.post("/api/sendmailforpwdchange", async (req, res) => {
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

app.post("/api/changePWD", async (req, res) => {
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
app.get("/api/registerUser", async (req, res) => {
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

app.post("/api/changeUserName", async (req, res) => {
    const token = req.headers["authorization"];
    try {
        const data = jwt.verify(token, secretcode);
        const updation = await User.updateOne({ email: data.email }, { $set: { name: req.body.Name } });
        const newToken = jwt.sign({
            name: req.body.Name,
            email: data.email,
        }, secretcode);
        res.send({ status: 'ok', token: newToken })

    } catch {
        res.send({ status: 'error', error: 'Network Issues' })
    }
});

app.post("/api/verifyotp",async(req,res)=>{
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
app.get("/",(req,res)=>{
    console.log("emocleW oT yM dlroW ")
})
app.listen(8000, () => {
    console.log(`Port is Running At http://localhost:8000`)
})