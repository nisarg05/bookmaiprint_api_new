const questionModel = require('../model/vendorQuestion');
const answerModel = require('../model/vendorAnswer');
const vendorModel = require('../model/vendorRegister');
const vendorQuestionAnswerMapModel = require('../model/vendorQuestionAnswerMap');
const allocateOrderModel = require('../model/allocateOrder');

const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const date = require('date-and-time');
const message = require('../config/message');
const mongoose = require("mongoose");
var FCM = require('fcm-node');
var serverKey = 'AIzaSyDBhIvqn5USZwg5RhDy97dKKCy-OcssmK4'; 
var fcm = new FCM(serverKey);
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const logger = require('../utils/logger').logger;

const vendorRegisterController = require('./vendorRegisterController');
const orderInfoController = require('./api/vendorOrderInfo');

exports.vendorByCategory = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_vendor_id(req.body.category_id);

        var questionsExists = await questionModel.find({category_id: req.body.category_id, deleted_at: null, has_answer: 0}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1});

        let result = [];
        for(let i = 0; i < questionsExists.length; i++)
        {
            let vendorDetails = await vendorRegisterController.user_details(questionsExists[i].vendor_id);
            result.push(vendorDetails);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                vendorList : result,
                totalPages : Math.ceil(count / limit),
                currentPage : page
            }
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

exports.assignOrderToVendor = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        
        const allocateOrder = new allocateOrderModel(
            {
                vendor_id: mongoose.Types.ObjectId(req.body.vendor_id),
                order_id: mongoose.Types.ObjectId(req.body.id),
                order_details_id: mongoose.Types.ObjectId(req.body.order_id),
                status: '0',
                created_at: new Date().getTime(),
                created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
            }
        )

        await allocateOrder.save();

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY
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

exports.assignedOrderListByVendor = async(req,res,next) => {
    try {
        const id = req.params.id;

        console.log(id,"id");

        let allocateOrderList = await allocateOrderModel.find({vendor_id:id});
        let result = [];

        for(let i = 0; i < allocateOrderList.length; i++)
        {
            let orderInfo = await orderInfoController.order_details(allocateOrderList[i].order_id, allocateOrderList[i].order_details_id)

            result.push({
                _id: allocateOrderList[i]._id,
                status: allocateOrderList[i].status,
                price: allocateOrderList[i].price,
                order_detail_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_detail_id : {},
                category_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_id : {},
                category_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_details : {},
                price_list_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_id : {},
                price_list_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_details : {},
                question_list: orderInfo != null && orderInfo.products != null ? orderInfo.products.question_list : {},
                upload_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.upload_details : {},
                package_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.package_details : {},
                order_details_status: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_status : {},
                order_details_timeline: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_timeline : {}
            });
        }

        console.log(result,"result");

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY,
            data:result
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

exports.statusOrderToVendor = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        
        var allocateExists = await allocateOrderModel.findOne({_id: req.body.id, deleted_at: null});

        if(allocateExists)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await allocateOrderModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ALLOCATE_ORDER_NOT_EXISTS
            })
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY
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

async function count_vendor_id(category_id) {
    const count = await questionModel.find({category_id: category_id, deleted_at: null, has_answer: 0}).count();
    return count;
}

