const mongoose = require("mongoose");

const requestCategorySchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Types.ObjectId, require: true },
    category_name: { type: String, default: null },
    created_at: { type: Number, default: new Date().getTime() },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("requestCategory", requestCategorySchema);