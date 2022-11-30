const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    image: { type: String, default: '' },
    cat_image: { type: Array, default: [] },
    is_enable: { type: Number, enum : [1,0], default: 1 },
    has_parent: { type: Number, enum : [1,0], default: 0 },
    is_parent_deleted: { type: Number, enum : [1,0], default: 0 },
    parent_id: { type: mongoose.Types.ObjectId, default: null },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("category", categorySchema);