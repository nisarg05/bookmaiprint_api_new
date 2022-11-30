const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
    name: { type: String, default: null },
    company_name: { type: String, default: null },
    mobile_no: { type: String, default: null },
    email: { type: String, default: null },
    product_details: { type: String, default: null },
    qty: { type:Number, default: 0 },
    address: { type: String, default: null },
    is_inquiry: { type: Number, enum : [2,1,0], default: 0 },
    order_id: { type: mongoose.Types.ObjectId, default: null },
    user_id: { type: mongoose.Types.ObjectId, default: null },
    is_recent: { type: Number, required: true, default: 1 },
    close_comment: { type: String, default: '' },
    status:{ type: String, enum : ["Pending","Viewed","Hold","Closed","InProgress"], default:"Pending"},
    invoice_no: { type: String, default: null },
    created_at: { type: Number, default: null },
    updated_at: { type: Number, default: null },
    deleted_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null },
    deleted_by: { type: mongoose.Types.ObjectId, default: null }
})

module.exports = mongoose.model("inquiry", inquirySchema);