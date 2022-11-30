const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    house_no: { type: String, require: true },
    address_line_1: { type: String, require: true },
    address_line_2: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    state_code: { type: String, default: "" },
    country_code: { type: String, default: "" },
    pincode: { type: String, default: "" },
    mobile_no: { type: String, default: "" },
    is_default: { type: Number, enum : [1,0], default: 0 },
    is_office: { type: Number, enum : [1,0], default: 0 },
    user_id: { type: mongoose.Types.ObjectId, require: true },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("address", addressSchema);