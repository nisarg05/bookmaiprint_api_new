const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema({
    user_id : { type: mongoose.Types.ObjectId, required: true },
    order_id : { type: mongoose.Types.ObjectId, required: true },
    status:{ type: String, default: null},
    payment_status:{ type: String, default: null},
    is_detailed_status: { type: Number, default: 0 },
    message: { type : String, default: null},
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("orderStatus", orderStatusSchema);