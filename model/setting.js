const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    sort_description: { type: String, default: "" },
    upload_file_description: { type: String, default: "" },
    subscription_description: { type: String, default: "" },
    footer_logo: { type: String, default: "" },
    footer_descrption: { type: String, default: "" },
    footer_copy_rights: { type: String, default: "" },
    linked_in_link: { type: String, default: "" },
    twitter_link: { type: String, default: "" },
    facebook_link: { type: String, default: "" },
    tax: { type: Number, default: 0 },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("setting", settingSchema);