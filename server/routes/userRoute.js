const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { ObjectId } = require("mongoose").Types;
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAi = new GoogleGenerativeAI(process.env.apiKey);
const model = genAi.getGenerativeModel({ model: 'gemini-2.5-flash' });
const verification=require("../middleware/jwtverification");

require('dotenv').config();
const secretcode = process.env.secretCode;
router.use(verification)

router.post("/pushCode", async (req, res) => {
    try {

        const newCode = {
            _id: new ObjectId(),
            code: req.body.Code,
            date: req.body.Date,
            name: req.body.name,
            extension: req.body.extension
        };

        await User.updateOne(
            { email: req.body.token.email },
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
router.post("/getUserData", async (req, res) => {
    try {
        const codesData = await User.findOne({ email: req.body.token.email });
        res.send({ status: 'ok', codes: codesData.codes, userName: codesData.name })

    } catch {
        res.send({ status: 'error' })
    }
})

router.post("/updateCode", async (req, res) => {
    try {

        const result = await User.updateOne(
            { email: req.body.token.email, "codes._id": new ObjectId(req.body._id) },
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

router.post("/updateTitle", async (req, res) => {
    try {

        const result = await User.updateOne(
            { email: req.body.token.email, "codes._id": new ObjectId(req.body._id) },
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

router.post("/deleteData", async (req, res) => {

    try {
        const id = req.body._id;

        const result = await User.updateOne(
            { email: req.body.token.email },
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

router.post('/AiData', async (req, res) => {
    
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

router.post("/changeUserName", async (req, res) => {
    
    try {
        const updation = await User.updateOne({ email: req.body.token.email }, { $set: { name: req.body.newname } });
        const newToken = jwt.sign({
            name: req.body.Name,
            email: req.body.token.email,
        }, secretcode);
        res.send({ status: 'ok', token: newToken })

    } catch {
        res.send({ status: 'error', error: 'Network Issues' })
    }
});

module.exports=router;

