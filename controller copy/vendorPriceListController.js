const userModel = require('../model/user');
const categoryModel = require('../model/category');
const questionModel = require('../model/vendorQuestion');
const answerModel = require('../model/vendorAnswer');
const priceListModel = require('../model/vendorPriceList');
const vendorModel = require('../model/vendorRegister');

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

exports.priceCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let answerExists = await answerModel.findOne({_id: req.body.answer_id, deleted_at: null});

        let priceExists = await priceListModel.findOne({answer_id: req.body.answer_id, deleted_at: null, price: req.body.price, qty: req.body.qty});

        if(answerExists)
        {
            if(priceExists)
            {
                res.status(200).json({
                    status:message.messages.FALSE,
                    message:message.messages.PRICE_ALREADY_EXISTS
                })                
            }
            else
            {
                const newPrice = new priceListModel(
                    {
                        vendor_id: mongoose.Types.ObjectId(answerExists.vendor_id),
                        category_id: mongoose.Types.ObjectId(answerExists.category_id),
                        question_id: mongoose.Types.ObjectId(answerExists.question_id),
                        answer_id: mongoose.Types.ObjectId(req.body.answer_id),
                        price: req.body.price != undefined && req.body.price != "undefined" && req.body.price != null && req.body.price != "null" && req.body.price != "" && parseInt(req.body.price) > 0 ? parseInt(req.body.price) : 0,
                        qty: req.body.qty != undefined && req.body.qty != "undefined" && req.body.qty != null && req.body.qty != "null" && req.body.qty != "" && parseInt(req.body.qty) > 0 ? parseInt(req.body.qty) : 0,
                        is_enable: req.body.is_enable != undefined && req.body.is_enable != "undefined" && req.body.is_enable != null && req.body.is_enable != "null" && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )
        
                await newPrice.save();

                await answerModel.updateOne({_id: req.body.answer_id},{$set :{has_price: 1, updated_at: new Date().getTime(), updated_by: mongoose.Types.ObjectId(user_id)}})

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_ADD_SUCCESSFULLY,
                    data: newPrice
                })
            }
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.SOMETHING_NOT_EXISTS
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

exports.priceUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let answerExists = await answerModel.findOne({_id: req.body.answer_id, deleted_at: null});

        let priceExists = await priceListModel.findOne({_id: req.body.id, deleted_at: null});

        let priceQtyExists = await priceListModel.findOne({answer_id: req.body.answer_id, deleted_at: null, price: req.body.price, qty: req.body.qty});

        var is_updated = true;

        if(priceExists && answerExists)
        {
            if(priceQtyExists && priceQtyExists._id.toString() != priceExists._id.toString()){ is_updated = false; }

            if(is_updated)
            {
                req.body.updated_at = new Date().getTime();
                req.body.updated_by = mongoose.Types.ObjectId(user_id);

                var details = await priceListModel.updateOne({_id: req.body.id},{$set :req.body});

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_UPDATE_SUCCESSFULLY
                })
            }
            else
            {
                res.status(200).json({
                    status:message.messages.FALSE,
                    message:message.messages.PRICE_ALREADY_EXISTS
                })
            }
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.SOMETHING_NOT_EXISTS
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

exports.priceStatusChange = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var priceExists = await priceListModel.findOne({_id: req.body.id, deleted_at: null});

        if(priceExists)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await priceListModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.PRICE_NOT_EXISTS
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

exports.priceDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var priceExists = await priceListModel.findOne({_id: req.body.id, deleted_at: null});

        if(priceExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var priceCount = await priceListModel.count({answer_id: priceExists.answer_id, deleted_at: null});

            if(priceCount > 1)
            {
                var details = await priceListModel.updateOne({_id: req.body.id},{$set :req.body});  
            }
            else
            {
                var details = await priceListModel.updateOne({_id: req.body.id},{$set :req.body});
                await answerModel.updateOne({_id: priceExists.answer_id},{$set :{has_price: 0, updated_at: new Date().getTime(), updated_by: mongoose.Types.ObjectId(user_id)}})
            }

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.PRICE_NOT_EXISTS
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

exports.getPriceList = async(req,res,next) => {
    try {
        var result = await get_price_by_answer(req.body.answer_id);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: result
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

exports.getPriceListByQuestion = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_price_list_by_question_id(req.body);

        var priceList = await priceListModel.find({question_id: mongoose.Types.ObjectId(req.body.question_id), deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < priceList.length; i++)
        {
            let details = await get_price_info(priceList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                prices : result,
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

exports.getPriceById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var priceList = await priceListModel.findOne({_id: id, deleted_at: null});

        details = await get_price_info(priceList[i]);

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

async function get_price_by_answer(answer_id) {
    var priceList = await priceListModel.find({answer_id: answer_id, deleted_at: null}).sort({_id: -1}), result = [];

    for(let i = 0; i < priceList.length; i++)
    {
        let details = await get_price_info(priceList[i]);
        result.push(details);
    }

    return result;
}

async function count_price_list(data) {
    const count = await priceListModel.find({answer_id: data.answer_id, deleted_at: null}).count();
    return count;
}

async function count_price_list_by_question_id(data) {
    const count = await priceListModel.find({question_id: data.question_id, deleted_at: null}).count();
    return count;
}

async function get_price_info(data) {
    let result = "";
    if(data)
    { 
        let category_info = await categoryModel.findOne({_id: data.category_id, deleted_at: null}).select(["name","description","is_enable"]).sort({id: -1}); 
        let question_info = await questionModel.findOne({_id: data.question_id, deleted_at: null}).select(["question"]).sort({id: -1});
        let ans_info = await answerModel.findOne({_id: data.answer_id, deleted_at: null}).select(["option"]).sort({id: -1});

        let present_date = new Date();
        let change_date = addHours(data.time, present_date);
        let difference_days = days(change_date, present_date)

        let vendor_info = await vendorModel.findOne({_id: data.vendor_id, deleted_at: null});

        result = {
            _id: data._id,
            category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && category_info != null ? data.category_id : null,
            category: category_info != null ? category_info : null,
            question_id: data.question_id != undefined && data.question_id != null && data.question_id != "" && question_info != null ? data.question_id : null,
            question: question_info != null ? question_info : null,
            answer_id: data.answer_id != undefined && data.answer_id != null && data.answer_id != "" && ans_info != null ? data.answer_id : null,
            answer: ans_info != null ? ans_info.option : null,
            price: data.price != undefined && data.price != null && data.price != "" && parseInt(data.price) > 0 ? data.price : 0,
            qty: data.qty != undefined && data.qty != null && data.qty != "" && parseInt(data.qty) > 0 ? data.qty : 0,
            change_date: changeDateFormat(change_date),
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" && parseInt(data.is_enable) == 1 || parseInt(data.is_enable) == "1" ? 1 : 0,
            description: data.description != undefined && data.description != null && data.description != "" ? data.description : null,
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null,
            vendor_id: data.vendor_id != undefined && data.vendor_id != null && data.vendor_id != "" && vendor_info != null ? data.vendor_id : null,
            vendor: vendor_info != null ? vendor_info : null,
        }
    }

    return result;
}

async function get_order_price_info(data,order_date) {
    let result = "";
    if(data)
    { 
        let category_info = await categoryModel.findOne({_id: data.category_id, deleted_at: null}).select(["name","description","is_enable"]).sort({id: -1}); 
        let question_info = await questionModel.findOne({_id: data.question_id, deleted_at: null}).select(["question"]).sort({id: -1});
        let ans_info = await answerModel.findOne({_id: data.answer_id, deleted_at: null}).select(["option"]).sort({id: -1});

        let present_date = new Date(order_date);
        let change_date = addHours(data.time, present_date);
        let difference_days = days(change_date, present_date)

        let vendor_info = await vendorModel.findOne({_id: data.vendor_id, deleted_at: null});

        result = {
            _id: data._id,
            category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && category_info != null ? data.category_id : null,
            category: category_info != null ? category_info : null,
            question_id: data.question_id != undefined && data.question_id != null && data.question_id != "" && question_info != null ? data.question_id : null,
            question: question_info != null ? question_info : null,
            answer_id: data.answer_id != undefined && data.answer_id != null && data.answer_id != "" && ans_info != null ? data.answer_id : null,
            answer: ans_info != null ? ans_info.option : null,
            price: data.price != undefined && data.price != null && data.price != "" && parseInt(data.price) > 0 ? data.price : 0,
            qty: data.qty != undefined && data.qty != null && data.qty != "" && parseInt(data.qty) > 0 ? data.qty : 0,
            time: data.time != undefined && data.time != null && data.time != "" && parseInt(data.time) > 0 ? data.time : 0,
            change_date: changeDateFormat(change_date),
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" && parseInt(data.is_enable) == 1 || parseInt(data.is_enable) == "1" ? 1 : 0,
            discount: data.discount != undefined && data.discount != null && data.discount != "" && parseInt(data.discount) > 0 ? parseInt(data.discount) : 0,
            description: data.description != undefined && data.description != null && data.description != "" ? data.description : null,
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null,
            vendor_id: data.vendor_id != undefined && data.vendor_id != null && data.vendor_id != "" && vendor_info != null ? data.vendor_id : null,
            vendor: vendor_info != null ? vendor_info : null,
        }
    }

    return result;
}

function changeDateFormat( date ) {
    // var d = new Date(date);
    // var date = ('0' + d.getDate()).slice(-2);
    // var month = ('0' + (d.getMonth()+1)).slice(-2);
    // var hours = d.getHours()
    //     minute = d.getMinutes();
    //     hours = (hours % 12) || 12;
    // var dateString = date + '/' + month + '/' + d.getFullYear() + " " + hours + ":" + minute;

    const options = {
        year: "numeric",
        month: "long",
        weekday: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true // This is the line of code we care about here
        /*
            false: displays 24hs format for time
            true: displays 12, AM and PM format
        */
    }; 

    let d = new Date(date);
    let local = d.toLocaleDateString("en-US", options);
    let fullDate = `${local}`;

    return fullDate;
}

function addHours(numOfHours, date) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  
    return date;
}

const days = (date_1, date_2) =>{
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}

module.exports.get_price_info = get_price_info;
module.exports.get_order_price_info = get_order_price_info;
module.exports.get_price_by_answer = get_price_by_answer;
module.exports.addHours = addHours;
module.exports.days = days;