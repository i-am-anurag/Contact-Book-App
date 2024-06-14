const mongoose = require('mongoose');

const ip_banned_schema = new mongoose.Schema({
    ip_address:{
        type: String,
        required: true,
    },
    expiry_time:{
        type: Date,
    }
});

const ip_banned = mongoose.model('ip_banned', ip_banned_schema,'ip_banned');

module.exports = ip_banned;