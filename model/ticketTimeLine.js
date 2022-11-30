const mongoose = require("mongoose");

const ticketLineSchema = new mongoose.Schema({
    user_id : { type: mongoose.Types.ObjectId, required: true },
    ticket_id : { type: mongoose.Types.ObjectId, required: true },
    comment: { type : String ,default: null},
    created_at: { type: Number, default: null}
});

module.exports = mongoose.model("ticketTimeline", ticketLineSchema);