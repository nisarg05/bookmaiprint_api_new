const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    question_id: { type: mongoose.Types.ObjectId, require: true },
    category_id: { type: mongoose.Types.ObjectId, require: true },
    image: { type: String, default: '' },
    option: { type: String, require: true },
    has_question: { type: Number, enum : [1,0], default: 0 },
    has_price: { type: Number, enum : [1,0], default: 0 },
    is_enable: { type: Number, enum : [1,0], default: 0 },
    parent_question_id: { type: mongoose.Types.ObjectId, default: null },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("answer", answerSchema);