const mongoose = require("mongoose");

const questionAnswerMapSchema = new mongoose.Schema({
    question_id: { type: mongoose.Types.ObjectId, default: null },
    answer_id: { type: mongoose.Types.ObjectId, default: null },
    parent_id: { type: mongoose.Types.ObjectId, default: null },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("questionAnswerMap", questionAnswerMapSchema);