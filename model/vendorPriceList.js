const mongoose = require("mongoose");

const vendorPriceListSchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Types.ObjectId, require: true },
    category_id: { type: mongoose.Types.ObjectId, require: true },
    question_id: { type: mongoose.Types.ObjectId, require: true },
    answer_id: { type: mongoose.Types.ObjectId, require: true },
    price: { type:Number, default: 0 },
    qty: { type:Number, default: 0 },
    is_enable: { type: Number, enum : [1,0], default: 1 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
})

module.exports = mongoose.model("vendorPriceList", vendorPriceListSchema);