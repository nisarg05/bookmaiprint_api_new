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

const userController = require('../controller/authController');

const crypto = require('crypto');
const algorithm = "aes-256-cbc"; 
const initVector = crypto.randomBytes(16);
var key = 'password';
const Securitykey = crypto.randomBytes(32);

const vendorModel = require('../model/vendorRegister');

exports.userCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        req.body.auth_user_id = user_id;

        let file = "";

        if(req.file && req.file.destination){
            await sharp(req.file.path)
            .resize(200, 200, {fit: sharp.fit.outside})
            .toFile('uploads/'+req.file.filename);
            fs.unlinkSync(req.file.path);

            file = 'uploads/'+req.file.filename;
        }
        req.body.profile_pic = file;

        var cipher = crypto.createCipher(algorithm, key);  
        var encryptedData = cipher.update(req.body.password, 'utf8', 'hex') + cipher.final('hex');

        const newUser = new vendorModel(
            {
                first_name: req.body.first_name != undefined && req.body.first_name != null && req.body.first_name != "" ? req.body.first_name : "",
                last_name: req.body.last_name != undefined && req.body.last_name != null && req.body.last_name != "" ? req.body.last_name : "",
                gender: req.body.gender != undefined && req.body.gender != null && req.body.gender != "" ? req.body.gender : 'male',
                company_name: req.body.company_name != undefined && req.body.company_name != null && req.body.company_name != "" ? req.body.company_name : "",
                website: req.body.website != undefined && req.body.website != null && req.body.website != "" ? req.body.website : "",
                mobile_no: req.body.mobile_no != undefined && req.body.mobile_no != null && req.body.mobile_no != "" ? req.body.mobile_no : "",
                email: req.body.email != undefined && req.body.email != null && req.body.email != "" ? req.body.email.toLowerCase() : "",
                password: encryptedData,
                address: req.body.address != undefined && req.body.address != null && req.body.address != "" ? req.body.address : "",
                city: req.body.city != undefined && req.body.city != null && req.body.city != "" ? req.body.city : "",
                city_code: req.body.city_code != undefined && req.body.city_code != null && req.body.city_code != "" ? req.body.city_code : "",
                state: req.body.state != undefined && req.body.state != null && req.body.state != "" ? req.body.state : "",
                state_code: req.body.state_code != undefined && req.body.state_code != null && req.body.state_code != "" ? req.body.state_code : "",
                country: req.body.country != undefined && req.body.country != null && req.body.country != "" ? req.body.country : "",
                country_code: req.body.country_code != undefined && req.body.country_code != null && req.body.country_code != "" ? req.body.country_code : "",
                pincode: req.body.pincode != undefined && req.body.pincode != null && req.body.pincode != "" ? req.body.pincode : "",
                profile_pic: req.body.profile_pic,
                is_active: req.body.is_active != undefined && req.body.is_active != null && req.body.is_active != "" && req.body.is_active == 1 || req.body.is_active == '1' ? 1 : 0,
            }
        );

        await newUser.save();

        await mailFunction.send_mail(req.body.email, "Login Credentials", "Your user name is : "+req.body.email+" and password is : "+req.body.password);

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

exports.userUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        req.body.updated_by = mongoose.Types.ObjectId(user_id);

        var userExists = await vendorModel.findOne({_id: req.body.id, deleted_at: null});

        if(userExists)
        {
            let file = "";

            if(req.file && req.file.destination){
                await sharp(req.file.path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.file.filename);
                fs.unlinkSync(req.file.path);

                if(userExists.profile_pic != undefined && userExists.profile_pic != null){
                    fs.unlinkSync(userExists.profile_pic)
                }

                file = 'uploads/'+req.file.filename;
            }
            else{
                file = userExists.profile_pic;
            }
            req.body.profile_pic = file;
            req.body.updated_at = new Date().getTime();

            await vendorModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
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

exports.userDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        req.body.deleted_by = mongoose.Types.ObjectId(user_id);

        var userExists = await vendorModel.findOne({_id: req.body.id, deleted_at: null});

        if(userExists)
        {
            req.body.deleted_at = new Date().getTime();

            await vendorModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
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

exports.userDetailById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var userList = await vendorModel.findOne({_id: id, deleted_at: null});

        if(userList)
        {
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY,
                data: await user_details(userList)
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
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

exports.userList = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_users();

        var userList = await vendorModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < userList.length; i++)
        {
            let details = await user_details(userList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                users : result,
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

exports.userCredentialShare = async(req,res,next) => {
    try {
        var userExists = await vendorModel.findOne({_id: req.params.id, deleted_at: null});

        if(userExists)
        {
            var decipher = crypto.createDecipher(algorithm, key);
            var decrypted = decipher.update(userExists.password, 'hex', 'utf8') + decipher.final('utf8');

            await mailFunction.send_mail(userExists.email, "Login Credentials", "Your user name is : "+userExists.email+" and password is : "+decrypted);

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_SHARE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
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

async function count_users() {
    const count = await vendorModel.find({deleted_at: null}).count();
    return count;
}

async function user_details(id) {
    var userExists = await vendorModel.findOne({_id: id}), details = null;
    if(userExists)
    {
        details = {
            _id: userExists._id,
            first_name: userExists.first_name != undefined && userExists.first_name != null && userExists.first_name != "" ? userExists.first_name : "",
            last_name: userExists.last_name != undefined && userExists.last_name != null && userExists.last_name != "" ? userExists.last_name : "",
            gender: userExists.gender,
            company_name: userExists.company_name != undefined && userExists.company_name != null && userExists.company_name != "" ? userExists.company_name : "",
            website: userExists.website != undefined && userExists.website != null && userExists.website != "" ? userExists.website : "",
            mobile_no: userExists.mobile_no != undefined && userExists.mobile_no != null && userExists.mobile_no != "" ? userExists.mobile_no : "",
            email: userExists.email != undefined && userExists.email != null && userExists.email != "" ? userExists.email.toLowerCase() : "",
            address: userExists.address != undefined && userExists.address != null && userExists.address != "" ? userExists.address : "",
            city: userExists.city != undefined && userExists.city != null && userExists.city != "" ? {label:userExists.city, value:userExists.city_code} : "",
            state: userExists.state != undefined && userExists.state != null && userExists.state != "" ? {label:userExists.state, value:userExists.state_code} : "",
            country: userExists.country != undefined && userExists.country != null && userExists.country != "" ? {label:userExists.country, value:userExists.country_code} : "",
            pincode: userExists.pincode != undefined && userExists.pincode != null && userExists.pincode != "" ? userExists.pincode : "",
            profile_pic: userExists.profile_pic != undefined && userExists.profile_pic != null && userExists.profile_pic != "" ? userExists.profile_pic : null,
            is_active: userExists.is_active != undefined && userExists.is_active != null && userExists.is_active == 1 || userExists.is_active == '1' ? 1 : 0,
            created_at: changeDateFormat(userExists.created_at),
            deleted_at: userExists.deleted_at != null ? changeDateFormat(userExists.deleted_at) : null
        }
    }

    return details;
}

function changeDateFormat( date ) {
    var d = new Date(date);
    var date = ('0' + d.getDate()).slice(-2);
    var month = ('0' + (d.getMonth()+1)).slice(-2);
    var dateString = date + '/' + month + '/' + d.getFullYear();

    return dateString;
}

module.exports.changeDateFormat = changeDateFormat;
module.exports.user_details = user_details;