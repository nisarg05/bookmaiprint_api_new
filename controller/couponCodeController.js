const userModel = require('../model/user');
const couponCodeModel = require('../model/couponCode');

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

exports.insertCouponCode = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var str = await couponCodeModel.findOne({coupon_name:req.body.coupon_name})
        if(str) {
            res.status(409).json({
                status:message.messages.FALSE,
                message:message.messages.ALREADY_CREATED_COUPON
            })
        }else {
            var insertcoupon = await couponCodeModel.create({
                coupon_name: req.body.coupon_name,
                coupontype_name: req.body.coupontype_name,
                flat_min_order_val: parseInt(req.body.flat_min_order_val),
                flat_value: parseInt(req.body.flat_value),
                percantage_min_order_val: parseInt(req.body.percantage_min_order_val),
                percantage_value: parseInt(req.body.percantage_value),
                percantage_max_value: parseInt(req.body.percantage_max_value),
                expire_date: new Date(req.body.expire_date).getTime(),
                created_at: new Date().getTime(),
                created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
            })
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
}

exports.selectCouponCode = async(req,res,next) => {
    try {
        var coupon = await couponCodeModel.find();
        res.status(200).json({
            data:coupon,
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
}

exports.selectCouponCodeById = async(req,res,next) => {
    try {
        var coupon = await couponCodeModel.findOne({_id: req.params.id});
        res.status(200).json({
            data:coupon,
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
} 

exports.editCouponCode = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        if(req.body.coupontype_name == "Flat") {
            var coupon = await couponCodeModel.updateOne({_id: req.body.id},{$set: {
                coupon_name: req.body.coupon_name,
                coupontype_name: req.body.coupontype_name,
                flat_min_order_val: parseInt(req.body.flat_min_order_val),
                flat_value: parseInt(req.body.flat_value),
                percantage_min_order_val: 0,
                percantage_value: 0,
                percantage_max_value: 0,
                expire_date: new Date(req.body.expire_date).getTime(),
                updated_at: new Date().getTime(),
                updated_by: mongoose.Types.ObjectId(user_id)
            }});
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }else {
              var coupon = await couponCodeModel.updateOne({_id: req.body.id},{$set: {
                coupon_name: req.body.coupon_name,
                coupontype_name: req.body.coupontype_name,
                flat_min_order_val: 0,
                flat_value: 0,
                percantage_min_order_val: parseInt(req.body.percantage_min_order_val),
                percantage_value: parseInt(req.body.percantage_value),
                percantage_max_value: parseInt(req.body.percantage_max_value),
                expire_date: new Date(req.body.expire_date).getTime(),
                updated_at: new Date().getTime(),
                updated_by: mongoose.Types.ObjectId(user_id)
            }});
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
} 

exports.deleteCouponCode = async(req, res, next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var couponCodeExists = await couponCodeModel.findOne({_id: req.params.id, deleted_at: null});

        if(couponCodeExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);
            var details = await couponCodeModel.updateOne({_id: req.params.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
}

exports.getCouponCode = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_coupon_code();

        var couponCodeList = await couponCodeModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < couponCodeList.length; i++)
        {
            let details = await get_coupon_code_info(couponCodeList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                couponCodes : result,
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

async function count_coupon_code() {
    const count = await couponCodeModel.find({deleted_at: null}).count();
    return count;
}

async function get_coupon_code_info(data) {
    let result = "";
    if(data)
    {
        result = {
            _id: data._id,
            coupon_name: data.coupon_name,
            coupontype_name: data.coupontype_name,
            flat_min_order_val: data.flat_min_order_val != undefined && data.flat_min_order_val != null && data.flat_min_order_val != "" ? parseInt(data.flat_min_order_val) : null,
            flat_value: data.flat_value != undefined && data.flat_value != null && data.flat_value != "" ? parseInt(data.flat_value) : null,
            percantage_min_order_val: data.percantage_min_order_val != undefined && data.percantage_min_order_val != null && data.percantage_min_order_val != "" ? parseInt(data.percantage_min_order_val) : null,
            percantage_value: data.percantage_value != undefined && data.percantage_value != null && data.percantage_value != "" ? parseInt(data.percantage_value) : null,
            percantage_max_value: data.percantage_max_value != undefined && data.percantage_max_value != null && data.percantage_max_value != "" ? parseInt(data.percantage_max_value) : null,
            expire_date: userController.changeDateFormat(data.expire_date),
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}