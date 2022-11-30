const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    mobile_no: { type: String, default: null },
    email_id: { type: String, default: null },
    otp: { type: String, unique: true },
    status: { type: String, enum : ['0','1','2'], default: '0' }//0 = pending, 1 = verified, 2 = expired
});

module.exports = mongoose.model("otp", otpSchema);