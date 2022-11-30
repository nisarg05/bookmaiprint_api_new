const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    title: { type: String, default: null },
    price: { type:Number, default: 0 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
})

module.exports = mongoose.model("deliveryCharge", deliverySchema);