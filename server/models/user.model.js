const mongoose = require('mongoose');

const User = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    GoogleUniqueId: {
        type: String,
        unique: true,
        sparse: true,
        default: null
    },
    codes: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            code: String,
            date: Date,
            extension: String,
        }
    ]
}, { collection: 'UserData' })

const model = mongoose.model('UserData', User);
module.exports = model;
