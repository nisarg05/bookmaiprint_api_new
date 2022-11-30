const mongoose = require("mongoose");

const vendorRegisterSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    gender: { type: String, enum : ['male','female','other'], default: 'male' },
    company_name: { type: String, default: null },
    website: { type: String, default: null },
    mobile_no: { type: String, default: null},
    email: { type: String, default: null },
    password: { type: String, default: null },
    address: { type: String, default: null},
    city: { type: String, default: null },
    city_code: { type: String, default: null },
    state: { type: String, default: null },
    state_code: { type: String, default: null },
    country: { type: String, default: null },
    country_code: { type: String, default: null },
    pincode: { type: String, default: null},
    profile_pic: { type: String, default: null },
    is_active: { type: Number, enum : [1,0], default: 0 },
    created_at: { type: Number, default: new Date().getTime() },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("vendorRegister", vendorRegisterSchema);