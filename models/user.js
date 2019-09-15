// importing mongoose
const mongoose = require('mongoose');

// creating a constant from mongoose.Schema
const Schema = mongoose.Schema;

// creating a user schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notifications: {
        type: Array,
        required: true
    },
    numberOfNewNotifications: {
        type: Number,
        required: true,
        default: 0
    },
    productsOfInterest: {
        type: Array,
        required: true
    }
});

// expoting the user schema
module.exports = mongoose.model('User', userSchema);