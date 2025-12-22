const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter=require("./routes/authRoute")
const userRouter=require("./routes/userRoute")

app.use(cors());
require('dotenv').config();
app.use(express.json())

mongoose.connect(process.env.mongoDbLink).then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch(err => console.error("❌ Connection error:", err));

app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);


app.get("/",(req,res)=>{
    res.send("dlroW yM oT emocleW")
})
app.listen(8000, () => {
    console.log(`Port is Running At http://localhost:8000`)
})