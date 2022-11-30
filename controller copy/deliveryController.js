const deliveryChargeModel = require('../model/deliveryCharge');

const message = require('../config/message');
const mongoose = require("mongoose");

exports.deliveryCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        if(req.body.id != undefined && req.body.id != "undefined" && req.body.id != null && req.body.id != "null" && req.body.id != "")
        {
            let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

            var deliveryChargeExists = await deliveryChargeModel.findOne({_id: req.body.id, deleted_at: null});

            if(deliveryChargeExists)
            {
                req.body.updated_at = new Date().getTime();
                req.body.updated_by = user_id != null ? mongoose.Types.ObjectId(user_id) : null;

                var details = await deliveryChargeModel.updateOne({_id: req.body.id},{$set :req.body});

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_UPDATE_SUCCESSFULLY
                })
            }
            else
            {
                const newDeliveryCharge = new deliveryChargeModel(
                    {
                        title: req.body.title,
                        price: req.body.price != undefined && req.body.price != "undefined" && req.body.price != null && req.body.price != "null" && req.body.price != "" && parseInt(req.body.price) > 0 ? parseInt(req.body.price) : 0,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )
        
                await newDeliveryCharge.save();
    
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_ADD_SUCCESSFULLY
                })
            }
        }
        else
        {
            const newDeliveryCharge = new deliveryChargeModel(
                {
                    title: req.body.title,
                    price: req.body.price != undefined && req.body.price != "undefined" && req.body.price != null && req.body.price != "null" && req.body.price != "" && parseInt(req.body.price) > 0 ? parseInt(req.body.price) : 0,
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )
    
            await newDeliveryCharge.save();

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY
            })
        }
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}

exports.getDeliveryCharge = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        
        var deliveryChargeList = await deliveryChargeModel.find({deleted_at: null}).limit(1).sort({_id: -1});

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
            message:error.message
        })
    }
}

exports.getDeliveryById = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        
        var deliveryChargeList = await deliveryChargeModel.findOne({_id: req.params.id, deleted_at: null});

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
            message:error.message
        })
    }
}

exports.deliveryDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var deliveryChargeExists = await deliveryChargeModel.findOne({_id: req.body.id, deleted_at: null});

        if(deliveryChargeExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = user_id != null ? mongoose.Types.ObjectId(user_id) : null;

            var details = await deliveryChargeModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.TRUE,
                message:message.messages.DELIVERY_CHARGE_NOT_EXISTS
            })
        }
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}