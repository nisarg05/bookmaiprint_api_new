const mongoose = require("mongoose");

const couponCodeSchema = new mongoose.Schema({
    coupon_name: { type: String, required: true, unique: true },
    coupontype_name : { type: String, required: true, default: null },
    flat_min_order_val : {type: Number, default: 0},
    flat_value : { type: Number, default: 0 },
    percantage_min_order_val : { type: Number, default: 0 },
    percantage_value: { type: Number, default: 0 },
    percantage_max_value : { type: Number, default: 0 },
    expire_date : { type: Number, default: null},
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
})

module.exports = mongoose.model("couponCode", couponCodeSchema);