const mongoose = require("mongoose");

const allocateOrderSchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Types.ObjectId, require: true },
    order_id: { type: mongoose.Types.ObjectId, require: true },
    order_details_id: { type: mongoose.Types.ObjectId, require: true },
    price: { type:Number, default: 0 },
    status: { type: Number, enum : [0,1,2], default: 0 },
    delivery_time: { type:Number, default: 0 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
})

module.exports = mongoose.model("allocateOrder", allocateOrderSchema);