const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    slug: { type: String, default: "" },
    title: { type: String, default: "" },
    is_enable: { type: Number, enum : [1,0], default: 0 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("menu", menuSchema);