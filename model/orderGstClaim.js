const mongoose = require("mongoose");

const orderGstClaimSchema = new mongoose.Schema({
    order_id: { type: mongoose.Types.ObjectId, default: null },
    user_id: { type: mongoose.Types.ObjectId, default: null },
    business_name: { type: String, default: null },
    gst_number: { type: String, default: null },
    address_1: { type: String, default: null },
    address_2: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
    created_at: { type: Number, default: new Date().getTime() },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("orderGstClaim", orderGstClaimSchema);