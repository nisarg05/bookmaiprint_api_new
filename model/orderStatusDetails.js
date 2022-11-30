const mongoose = require("mongoose");

const orderStatusDetailsSchema = new mongoose.Schema({
    order_status_id : { type: mongoose.Types.ObjectId, required: true },
    order_detail_id : { type: mongoose.Types.ObjectId, required: true },
    status:{ type: String, default: null},
    message: { type : String, default: null},
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("orderStatusDetails", orderStatusDetailsSchema);