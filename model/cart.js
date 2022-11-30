const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    category_id: { type: mongoose.Types.ObjectId, require: true },
    // question_id: { type: mongoose.Types.ObjectId, require: true },
    // answer_id: { type: mongoose.Types.ObjectId, require: true },
    price_list_id: { type: mongoose.Types.ObjectId, require: true },
    user_id: { type: mongoose.Types.ObjectId, require: true },
    question_list: { type: String, require: true },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("cart", cartSchema);