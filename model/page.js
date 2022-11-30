const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    menu_id: { type: mongoose.Types.ObjectId, require: true },
    sort_description: { type: String, default: "" },
    description: { type: String, default: "" },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("page", pageSchema);