const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
    image: { type: String, default: '' },
    image_type: { type: String, default: '' },
    image_extention: { type: String, default: '' },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("upload", uploadSchema);