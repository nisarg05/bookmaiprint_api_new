const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema({
    category_id: { type: mongoose.Types.ObjectId, required: true },
    price_list_id: { type: mongoose.Types.ObjectId, required: true },
    price_list_time: { type: Number, default: 0 },
    user_id: { type: mongoose.Types.ObjectId, required: true },
    order_id: { type: mongoose.Types.ObjectId, required: true },
    question_list: { type: String, default:""},
    upload_file_id: { type: mongoose.Types.ObjectId, default: null},
    package_id: { type: mongoose.Types.ObjectId, default: null},
    package_time: { type: Number, default: 0 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("orderDetail", orderDetailSchema);