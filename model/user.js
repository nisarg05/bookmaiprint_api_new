const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, default: null },
    mobile_no: { type: String, default: null},
    mobile_no_2: { type: String, default: null},
    password: { type: String, default: null },
    gender: { type: String, enum : ['male','female','other'], default: 'male' },
    role: { type: String, enum : ['user','admin','sub_admin'], default: 'user' },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    joined: { type:Number, default: new Date().getTime() },
    token: { type: String, default: null },
    profile_pic: { type: String, default: null },
    s_id: { type: String, default: null },
    is_blocked: { type: Number, enum : [1,0], default: 0 },
    is_active: { type: Number, enum : [1,0], default: 0 },
    is_registered: { type: Number, enum : [1,0], default: 0 },
    company_name: { type: String, default: null },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("user", userSchema);