const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true },
    invoice_no:{type: String, required: true },
    transaction_id:{type: String, required: false },
    total:{type:Number},
    discount:{type:Number},
    coupon_code_id:{type: mongoose.Types.ObjectId, default: null },
    gst:{type:Number, default: 0},
    comment: { type: String, default:""},
    user_address_id:{type: mongoose.Types.ObjectId, required: true },
    payment_mode_id:{type: mongoose.Types.ObjectId, required: false, default: null },
    delivery_type_id:{type: mongoose.Types.ObjectId, required: false, default: null },
    delivery_price:{type: Number, default: 0 },
    is_deliver_same_address:{type: Number, default: 0 },
    status:{ type: String, enum : ["pending","confirmed","payment_failed","delivered","cancelled","return","in_transit"], default:"pending"},
    payment_status:{ type: String, enum : ["payment_pending","payment_success","payment_failed"], default:"payment_pending"},
    is_placed: { type: Number, required: true, default: 0 },
    is_recent: { type: Number, required: true, default: 1 },
    tax: { type:Number, default: 0 },
    tax_amount: { type:Number, default: 0 },
    invoice_url:{type: String, default: null },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("order", orderSchema);