const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoice_image:{ type: String,default:null },
    invoice_name_with_address : {type: String,default:null },
    name_of_state: {type: String,default:null},
    license_order:  {type: String,default:null},
    license_sent: {type: String,default:null},
    place_of_supply: {type: String,default:null},
    auth_logo: {type: String,default:null},
    auth_name: {type: String,default:null},
    active : {type: Number,default:0},
    created_at: { type: Number, default: new Date().getTime() },
    updated_at: { type: Number, default: null },
    created_by: { type: mongoose.Types.ObjectId, default: null },
    updated_by: { type: mongoose.Types.ObjectId, default: null }
});

module.exports = mongoose.model("invoice", invoiceSchema);