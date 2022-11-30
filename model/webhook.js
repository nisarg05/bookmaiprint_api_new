const mongoose = require("mongoose");

const webhookDescriptionSchema = new mongoose.Schema({
    description: { type: String, require: true },
});

module.exports = mongoose.model("webhookDescription", webhookDescriptionSchema);