const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    category_id: { type: mongoose.Types.ObjectId, default: null },
    title: { type: String, default: null },
    description: { type: String, default: null },
    image: { type: String, default: null },
    show_in_frontend: { type: Number, enum : [1,0], default: 0 },
    is_enable: { type: Number, enum : [1,0], default: 1 },
    time: { type: Number, default: 0 },
    charge: { type: Number, default: 0 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("package", packageSchema);