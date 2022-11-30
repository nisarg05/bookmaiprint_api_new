const userModel = require('../model/user');
const categoryModel = require('../model/category');
const inquiryModel = require('../model/inquiry');
const orderModel = require('../model/order');

const userController = require('../controller/authController');

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

const mailFunction = require('../config/mail');

exports.inquiryCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        
        const newInquiry = new inquiryModel(
            {
                name: req.body.name != undefined && req.body.name != null  && req.body.name != "" ? req.body.name : null,
                company_name: req.body.company_name != undefined && req.body.company_name != null  && req.body.company_name != "" ? req.body.company_name : null,
                mobile_no: req.body.mobile_no != undefined && req.body.mobile_no != null  && req.body.mobile_no != "" ? req.body.mobile_no : null,
                email: req.body.email != undefined && req.body.email != null  && req.body.email != "" ? req.body.email : null,
                product_details: req.body.product_details != undefined && req.body.product_details != null  && req.body.product_details != "" ? req.body.product_details : null,
                qty: req.body.qty != undefined && req.body.qty != null  && req.body.qty != "" && parseInt(req.body.qty) > 0 ? parseInt(req.body.qty) : null,
                address: req.body.address != undefined && req.body.address != null  && req.body.address != "" ? req.body.address : null,
                is_inquiry: req.body.is_inquiry != undefined && req.body.is_inquiry != null  && req.body.is_inquiry != "" && req.body.is_inquiry == 1 || req.body.is_inquiry == '1' || req.body.is_inquiry == 2 || req.body.is_inquiry == '2' ? parseInt(req.body.is_inquiry) : 0,
                order_id: req.body.order_id != undefined && req.body.order_id != null  && req.body.order_id != "" ? mongoose.Types.ObjectId(req.body.order_id) : null,
                invoice_no: req.body.invoice_no != undefined && req.body.invoice_no != null  && req.body.invoice_no != "" ? req.body.invoice_no : null,
                user_id: req.body.user_id != undefined && req.body.user_id != null  && req.body.user_id != "" ? mongoose.Types.ObjectId(req.body.user_id) : null,
                created_at: new Date().getTime(),
                created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
            }
        )

        await newInquiry.save();

        if(req.body.is_inquiry != undefined && req.body.is_inquiry != null  && req.body.is_inquiry != "" && req.body.is_inquiry == 1 || req.body.is_inquiry == '1' || req.body.is_inquiry == 2 || req.body.is_inquiry == '2')
        {
            await mailFunction.send_mail(req.body.email, "New Inquiry", req.body.product_details);
        }

        if(req.body.is_inquiry != undefined && req.body.is_inquiry != null  && req.body.is_inquiry != "" && req.body.is_inquiry == 1 || req.body.is_inquiry == '1' || req.body.is_inquiry == 2 || req.body.is_inquiry == '2')
        {
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY
            })
        }
        else
        {
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.SUBSCRIPTION_ADDED
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

exports.inquiryDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var inquiryExists = await inquiryModel.findOne({_id: req.body.id, deleted_at: null});

        if(inquiryExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var details = await inquiryModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.CATEGORY_NOT_EXISTS
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

exports.getIquiries = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_inquiries(1);

        var inquiryList = await inquiryModel.find({deleted_at: null, is_inquiry: 1}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < inquiryList.length; i++)
        {
            let details = await get_inquiry_info(inquiryList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                inquiries : result,
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

exports.getSubscribe = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_inquiries(0);

        var inquiryList = await inquiryModel.find({deleted_at: null, is_inquiry: 0}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < inquiryList.length; i++)
        {
            let details = await get_inquiry_info(inquiryList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                inquiries : result,
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

exports.getOrderInquiry = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_inquiries(2);

        var inquiryList = await inquiryModel.find({deleted_at: null, is_inquiry: 2}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < inquiryList.length; i++)
        {
            let details = await get_inquiry_info(inquiryList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                inquiries : result,
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

exports.getRecentOrderInquiryCount = async(req,res,next) => {
    try{
        let condition = {
            deleted_at: null,
            is_recent: 1,
            is_inquiry: 2
        }

        let ordersCounter = await inquiryModel.count(condition)

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            counter:ordersCounter
        })
    }
    catch(error){
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}

exports.getIquiryById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var inquiryList = await inquiryModel.findOne({_id: id, deleted_at: null});

        let details = await get_inquiry_info(inquiryList);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: details
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

async function count_inquiries(status) {
    const count = await inquiryModel.find({deleted_at: null, is_inquiry: status}).count();
    return count;
}

async function get_inquiry_info(data) {
    let result = "";
    if(data)
    {
        let order_id = null;
        if(data.invoice_no != undefined && data.invoice_no != null && data.invoice_no != "")
        {
            order_id = await orderModel.findOne({_id: data.order_id});
        }

        result = {
            _id: data._id,
            name: data.name,
            company_name: data.company_name != undefined && data.company_name != null && data.company_name != "" ? data.company_name : null,
            mobile_no: data.mobile_no != undefined && data.mobile_no != null && data.mobile_no != "" ? data.mobile_no : null,
            email: data.email != undefined && data.email != null && data.email != "" ? data.email : null,
            product_details: data.product_details != undefined && data.product_details != null && data.product_details != "" ? data.product_details : null,
            qty: data.qty != undefined && data.qty != null && data.qty != "" && data.qty > 0 ? data.qty : null,
            address: data.address != undefined && data.address != null && data.address != "" ? data.address : null,
            invoice_no: data.invoice_no != undefined && data.invoice_no != null && data.invoice_no != "" ? data.invoice_no : null,
            order_id: order_id,
            status: data.status != undefined && data.status != null && data.status != "" ? data.status : null,
            close_comment: data.close_comment != undefined && data.close_comment != null && data.close_comment != "" ? data.close_comment : null,
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}