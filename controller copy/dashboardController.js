const userModel = require('../model/user');
const categoryModel = require('../model/category');

const userController = require('../controller/authController');
const categoryController = require('../controller/categoryController');
const inquiryModel = require('../model/inquiry');
const orderModel = require('../model/order');

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

exports.index = async(req,res,next) => {
    try {
        let active_user = await userModel.count({role: 'user', deleted_at: null, is_blocked: 0});
        let blocked_user = await userModel.count({role: 'user', deleted_at: null, is_blocked: 1});
        let deleted_user = await userModel.count({role: 'user', deleted_at: {$ne: null}});
        let category = await categoryModel.count({deleted_at: null, is_enable: 1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                activeUser: active_user,
                blockedUser: blocked_user,
                deletedUser: deleted_user,
                category: category
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

exports.sidebar_counters = async(req,res,next) => {
    try {
        let condition = {
            deleted_at: null,
            is_recent: 1
        }

        let inquiry_condition = {
            deleted_at: null,
            is_recent: 1,
            is_inquiry: 2
        }

        let ordersCounter = await orderModel.count(condition)
        let orderInquiresCounter = await inquiryModel.count(inquiry_condition)

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            counter:ordersCounter,
            inquiry_counter:orderInquiresCounter
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