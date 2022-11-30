const userModel = require('../model/user');
const addressModel = require('../model/address');

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

exports.addressCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        const newAddress = new addressModel(
            {
                name: req.body.name,
                house_no: req.body.house_no,
                address_line_1: req.body.address_line_1,
                address_line_2: req.body.address_line_2 != undefined && req.body.address_line_2 != null && req.body.address_line_2 != "undefined" && req.body.address_line_2 != "null" && req.body.address_line_2 != "" ? req.body.address_line_2 : "",
                landmark: req.body.landmark != undefined && req.body.landmark != null && req.body.landmark != "undefined" && req.body.landmark != "null" && req.body.landmark != "" ? req.body.landmark : "",
                city: req.body.city != undefined && req.body.city != null && req.body.city != "undefined" && req.body.city != "null" && req.body.city != "" ? req.body.city : "",
                state: req.body.state != undefined && req.body.state != null && req.body.state != "undefined" && req.body.state != "null" && req.body.state != "" ? req.body.state : "",
                country: req.body.country != undefined && req.body.country != null && req.body.country != "undefined" && req.body.country != "null" && req.body.country != "" ? req.body.country : "",
                state_code: req.body.state_code != undefined && req.body.state_code != null && req.body.state_code != "undefined" && req.body.state_code != "null" && req.body.state_code != "" ? req.body.state_code : "",
                country_code: req.body.country_code != undefined && req.body.country_code != null && req.body.country_code != "undefined" && req.body.country_code != "null" && req.body.country_code != "" ? req.body.country_code : "",
                pincode: req.body.pincode != undefined && req.body.pincode != null && req.body.pincode != "undefined" && req.body.pincode != "null" && req.body.pincode != "" ? req.body.pincode : "",
                is_default: req.body.is_default != undefined && req.body.is_default != null && req.body.is_default == 1 || req.body.is_default == '1' ? 1 : 0,
                is_office: req.body.is_office != undefined && req.body.is_office != null && req.body.is_office == 1 || req.body.is_office == '1' ? 1 : 0,
                mobile_no: req.body.mobile_no != undefined && req.body.mobile_no != null && req.body.mobile_no != "undefined" && req.body.mobile_no != "null" && req.body.mobile_no != "" ? req.body.mobile_no : "",
                user_id: req.body.user_id != undefined && req.body.user_id != "undefined" && req.body.user_id != null && req.body.user_id != "null" && req.body.user_id != '' ? mongoose.Types.ObjectId(req.body.user_id) : "",
                created_at: new Date().getTime(),
                created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : ""
            }
        )

        await newAddress.save();

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

exports.addressUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var addressExists = await addressModel.findOne({_id: req.body.id, deleted_at: null});

        if(addressExists)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await addressModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ADDRESS_NOT_EXISTS
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

exports.addressStatusUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var addressExists = await addressModel.findOne({_id: req.body.id, deleted_at: null});

        if(addressExists)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            if(req.body.is_default == 1)
            {
                let allAddress = await addressModel.find({user_id: addressExists.user_id, deleted_at: null});

                for(let i = 0; i < allAddress.length; i++)
                {
                    if(allAddress[i]._id == req.body.id)
                    {
                        req.body.is_default = 1;
                        let details = await addressModel.updateOne({_id: allAddress[i]._id},{$set :req.body});
                    }
                    else
                    {
                        req.body.is_default = 0;
                        req.body.updated_at = new Date().getTime();
                        req.body.updated_by = mongoose.Types.ObjectId(user_id);
                        let details = await addressModel.updateOne({_id: allAddress[i]._id},{$set :req.body});
                    }
                }
            }
            else
            {
                let details = await addressModel.updateOne({_id: req.body.id},{$set :req.body});
            }

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ADDRESS_NOT_EXISTS
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

exports.addressDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var addressExists = await addressModel.findOne({_id: req.body.id, deleted_at: null});

        if(addressExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var details = await addressModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ADDRESS_NOT_EXISTS
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

exports.getAddress = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        const page = req.params.page;
        const limit = 20;
        var count = await count_addresses(user_id);

        var addressList = await addressModel.find({user_id: user_id, deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < addressList.length; i++)
        {
            let details = await get_address_info(addressList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                addresses : result,
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

exports.getAddressWithOutPagination = async(req,res,next) => {
    try {
        let user_id = req.params.id;

        var addressList = await addressModel.find({user_id: user_id, deleted_at: null}).sort({_id: -1}), result = [];

        for(let i = 0; i < addressList.length; i++)
        {
            let details = await get_address_info(addressList[i]);
            result.push(details);
        }

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

exports.getAddressById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var addressList = await addressModel.findOne({_id: id, deleted_at: null}), result = null;

        if(addressList)
        {
            result = await get_address_info(addressList);
        }

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

async function count_addresses(user_id) {
    const count = await addressModel.find({user_id: user_id, deleted_at: null}).count();
    return count;
}

async function get_address_info(data) {
    let result = "";
    if(data)
    {
        let parent_info = await userModel.findOne({_id: data.user_id, deleted_at: null}).select(["name"]).sort({id: -1});

        result = {
            _id: data._id,
            name: data.name,
            house_no: data.house_no != undefined && data.house_no != null && data.house_no != "" ? data.house_no : "",
            address_line_1: data.address_line_1 != undefined && data.address_line_1 != null && data.address_line_1 != "" ? data.address_line_1 : "",
            address_line_2: data.address_line_2 != undefined && data.address_line_2 != null && data.address_line_2 != "" ? data.address_line_2 : "",
            landmark: data.landmark != undefined && data.landmark != null && data.landmark != "" ? data.landmark : "",
            city: data.city != undefined && data.city != null && data.city != "" ? data.city : "",
            state: data.state != undefined && data.state != null && data.state != "" ? data.state : "",
            country: data.country != undefined && data.country != null && data.country != "" ? data.country : "",
            state_code: data.state_code != undefined && data.state_code != null && data.state_code != "" ? data.state_code : "",
            country_code: data.country_code != undefined && data.country_code != null && data.country_code != "" ? data.country_code : "",
            pincode: data.pincode != undefined && data.pincode != null && data.pincode != "" ? data.pincode : "",
            mobile_no: data.mobile_no != undefined && data.mobile_no != null && data.mobile_no != "" ? data.mobile_no : "",
            is_default: data.is_default != undefined && data.is_default != null && data.is_default != "" && data.is_default == 1 || data.is_default == "1" ? 1 : 0,
            is_office: data.is_office != undefined && data.is_office != null && data.is_office != "" && data.is_office == 1 && data.is_office == '1' ? 1 : 0,
            user_id: data.user_id != undefined && data.user_id != null && data.user_id != "" && parent_info != null ? data.user_id : "",
            user_name: parent_info != null ? parent_info.name : "",
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : ""
        }
    }

    return result;
}

module.exports.get_address_info = get_address_info;