const deliveryChargeModel = require('../../model/deliveryCharge');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");
const logger = require('../../utils/logger').logger;

exports.getChargeList = async(req,res,next) => {
    try {
        var deliveryChargeList = await deliveryChargeModel.findOne({deleted_at: null}).sort({_id: -1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: deliveryChargeList
        })
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}