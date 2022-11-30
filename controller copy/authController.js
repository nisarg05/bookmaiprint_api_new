const user = require('../model/user');
const address = require('../model/address');
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

exports.adminLogin = async(req,res,next) => {
    try {
        var userExists = await user.findOne({email: req.body.email.toLowerCase(), role: req.body.role});
        if(userExists != "" && userExists != null)
        {
            if(await bcrypt.compare(req.body.password, userExists.password))
            {
                const token = jwt.sign(
                    { user_id: userExists._id, email: req.body.email.toLowerCase()},
                    message.messages.JWT_STRING,
                    {
                        expiresIn: "2h",
                    }
                );

                await user.updateOne({email: userExists.email.toLowerCase()},{$set :{token:token}})
                        
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.USER_LOGIN,
                    data:{
                        token: token,
                        user_details: await user_details(userExists)
                    }
                })
            }
            else
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.PASSWORD_NOT_MATCH
                })
            }
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
        console.log("error 1",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}

exports.changeAdminPassword = async(req,res,next) => {
    try {
        var userExists = await user.findOne({email: req.body.email.toLowerCase(), role: req.body.role});
        if(userExists != "" && userExists != null && (await bcrypt.compare(req.body.password, userExists.password)))
        {
            let encryptedPassword = await bcrypt.hash(req.body.new_password, 10)
            await user.updateOne({email: userExists.email.toLowerCase()},{$set :{password:encryptedPassword}})
                    
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.CHANGE_PASSWORD_SUCCESSFULLY
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

        let condition = [{email: req.body.email.toLowerCase()}]
        if(req.body.mobile_no != undefined && req.body.mobile_no != "undefined" && req.body.mobile_no != null && req.body.mobile_no != "null" && req.body.mobile_no != "")
        {
            condition.push({mobile_no: req.body.mobile_no});
        }

        var userExists = await user.findOne({
            role: req.body.role,
            deleted_at: null,
            $and: [
                { $or: condition }
            ]
        });

        if(userExists)
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_ALREADY_REGISTERED
            })
        }
        else
        {
            let userDetails = await create_user(req.body);

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

exports.userUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        req.body.updated_by = mongoose.Types.ObjectId(user_id);

        var userExists = await user.findOne({_id: req.body.id, deleted_at: null});

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

            let userDetails = await update_user(req.body);

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

        var userExists = await user.findOne({_id: req.body.id, deleted_at: null});

        if(userExists)
        {
            req.body.deleted_at = new Date().getTime();

            let userDetails = await update_user(req.body);

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

exports.userDeleteUndo = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        req.body.updated_by = mongoose.Types.ObjectId(user_id);
        req.body.deleted_by = null;

        var userExists = await user.findOne({_id: req.body.id, deleted_at: {$ne: null}});

        if(userExists)
        {
            var newUserCreate = await user.findOne({
                $and: [
                    { $or: [{email: userExists.email}, {mobile_no: userExists.mobile_no}] }
                ],
                deleted_at: null
            });

            if(newUserCreate)
            {
                res.status(200).json({
                    status:message.messages.FALSE,
                    message:message.messages.CONTACT_DETAILS_REGISTERED
                })
            }
            else
            {
                req.body.updated_at = new Date().getTime();
                req.body.deleted_at = null;

                let userDetails = await update_user(req.body);

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_UPDATE_SUCCESSFULLY
                })
            }
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

        var userList = await user.findOne({_id: id, deleted_at: null});

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

        var userList = await user.find({role: 'user', deleted_at: null, is_blocked: 0}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

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

exports.deletedUserList = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_deleted_users();

        var userList = await user.find({role: 'user', deleted_at: {$ne: null}}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

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

exports.blockedUserList = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_blocked_users();

        var userList = await user.find({role: 'user', deleted_at: null, is_blocked: 1}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

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

exports.changeUserPassword = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? mongoose.Types.ObjectId(req.user.user_id) : null;
        console.log(user_id);
        if(user_id)
        {
            var userExists = await user.findOne({_id: user_id});
            if(userExists != "" && userExists != null)
            {
                if((await bcrypt.compare(req.body.password, userExists.password)))
                {
                    let encryptedPassword = await bcrypt.hash(req.body.new_password, 10)
                    await user.updateOne({email: userExists.email.toLowerCase()},{$set :{password:encryptedPassword}})
                            
                    res.status(200).json({
                        status:message.messages.TRUE,
                        message:message.messages.CHANGE_PASSWORD_SUCCESSFULLY
                    })
                }
                else
                {
                    res.status(400).json({
                        status:message.messages.FALSE,
                        message:message.messages.PASSWORD_NOT_MATCH
                    })
                }
            }
            else
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.USER_NOT_EXISTS
                })
            }
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
    const count = await user.find({role: 'user', deleted_at: null, is_blocked: 0}).count();
    return count;
}

async function count_deleted_users() {
    const count = await user.find({role: 'user', deleted_at: {$ne: null}}).count();
    return count;
}

async function count_blocked_users() {
    const count = await user.find({role: 'user', deleted_at: null, is_blocked: 1}).count();
    return count;
}

async function create_user(data) {
    let encryptedPassword = await bcrypt.hash(data.password, 10);
    const newUser = new user(
        {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email.toLowerCase(),
            password: encryptedPassword,
            country_code: data.country_code != undefined && data.country_code != null && data.country_code != "" ? data.country_code : null,
            mobile_no: data.mobile_no != undefined && data.mobile_no != null && data.mobile_no != "" ? data.mobile_no : null,
            company_name: data.company_name != undefined && data.company_name != null && data.company_name != "" ? data.company_name : null,
            country_code_2: data.country_code_2 != undefined && data.country_code_2 != null && data.country_code_2 != "" ? data.country_code_2 : null,
            mobile_no_2: data.mobile_no_2 != undefined && data.mobile_no_2 != null && data.mobile_no_2 != "" ? data.mobile_no_2 : null,
            gender: data.gender != undefined && data.gender != null && data.gender != "" ? data.gender : 'male',
            role: data.role != undefined && data.role != null && data.role != "" && data.role != 'user' ? (data.role == 'admin' ? 'admin' : 'sub_admin') : 'user',
            city: data.city != undefined && data.city != null && data.city != "" ? data.city : null,
            state: data.state != undefined && data.state != null && data.state != "" ? data.state : null,
            country: data.country != undefined && data.country != null && data.country != "" ? data.country : null,
            is_blocked: data.is_blocked != undefined && data.is_blocked != null && data.is_blocked == 1 || data.is_blocked == '1' ? 1 : 0,
            profile_pic: data.profile_pic != undefined && data.profile_pic != null && data.profile_pic != "" ? data.profile_pic : null,
            joined: new Date().getTime(),
            created_at: new Date().getTime(),
            created_by: data.auth_user_id != null ? mongoose.Types.ObjectId(data.auth_user_id) : null
        }
    );

    await newUser.save();

    return newUser;
}

async function update_user(data) {
    var details = await user.updateOne({_id: data.id},{$set :data});

    return details;
}

async function user_details(id) {
    var userExists = await user.findOne({_id: id}), details = null;
    if(userExists)
    {
        var addressExists = await address.findOne({user_id: id, deleted_at: null}).sort({_id: -1});

        details = {
            _id: userExists._id,
            first_name: userExists.first_name != undefined && userExists.first_name != null && userExists.first_name != "" ? userExists.first_name : "",
            last_name: userExists.last_name != undefined && userExists.last_name != null && userExists.last_name != "" ? userExists.last_name : "",
            email: userExists.email != undefined && userExists.email != null && userExists.email != "" ? userExists.email.toLowerCase() : "",
            mobile_no: userExists.mobile_no != undefined && userExists.mobile_no != null && userExists.mobile_no != "" ? userExists.mobile_no : "",
            mobile_no_2: userExists.mobile_no_2 != undefined && userExists.mobile_no_2 != null && userExists.mobile_no_2 != "" ? userExists.mobile_no_2 : "",
            gender: userExists.gender,
            role: userExists.role,
            city: userExists.city != undefined && userExists.city != null && userExists.city != "" ? userExists.city : "",
            state: userExists.state != undefined && userExists.state != null && userExists.state != "" ? userExists.state : "",
            country: userExists.country != undefined && userExists.country != null && userExists.country != "" ? userExists.country : "",
            company_name: userExists.company_name != undefined && userExists.company_name != null && userExists.company_name != "" ? userExists.company_name : "",
            is_blocked: userExists.is_blocked != undefined && userExists.is_blocked != null && userExists.is_blocked == 1 || userExists.is_blocked == '1' ? 1 : 0,
            profile_pic: userExists.profile_pic != undefined && userExists.profile_pic != null && userExists.profile_pic != "" ? userExists.profile_pic : null,
            address: addressExists == null ? '' : addressExists,
            joined: changeDateFormat(userExists.joined),
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
module.exports.create_user = create_user;
module.exports.update_user = update_user;