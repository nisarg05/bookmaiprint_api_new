const userModel = require('../model/user');
const categoryModel = require('../model/category');
const packageModel = require('../model/package');

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

exports.packageCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let file = "";

        if(req.file && req.file.destination){
            await sharp(req.file.path)
            .resize(615, 371, {fit: sharp.fit.outside})
            .toFile('uploads/'+req.file.filename);
            fs.unlinkSync(req.file.path);

            file = 'uploads/'+req.file.filename;
        }

        var packageExists = await packageModel.findOne({title: req.body.title});

        if(packageExists)
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.PACKAGE_NAME_EXISTS
            })
        }
        else
        {
            const newPackage = new packageModel(
                {
                    title: req.body.title,
                    description: req.body.description,
                    image: file,
                    is_enable: req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0,
                    show_in_frontend: req.body.show_in_frontend != undefined && req.body.show_in_frontend != null && req.body.show_in_frontend == 1 || req.body.show_in_frontend == '1' ? 1 : 0,
                    time: req.body.time != undefined && req.body.time != null && parseInt(req.body.time) > 0 ? parseInt(req.body.time) : 0,
                    charge: req.body.charge != undefined && req.body.charge != null && parseInt(req.body.charge) > 0 ? parseInt(req.body.charge) : 0,
                    category_id: req.body.category_id != undefined && req.body.category_id != "undefined" && req.body.category_id != null && req.body.category_id != "null" && req.body.category_id != '' ? mongoose.Types.ObjectId(req.body.category_id) : null,
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )

            await newPackage.save();

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

exports.packageUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var packageExists = await packageModel.findOne({_id: req.body.id, deleted_at: null});

        if(packageExists)
        {
            let file = "";

            if(req.file && req.file.destination){
                await sharp(req.file.path)
                .resize(615, 371, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.file.filename);
                fs.unlinkSync(req.file.path);

                if(packageExists.image != undefined && packageExists.image != null && packageExists.image != "null" && packageExists.image != ""){
                    fs.unlinkSync(packageExists.image)
                }

                file = 'uploads/'+req.file.filename;
            }
            else
            {
                file = packageExists.image;
            }

            req.body.image = file;
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await packageModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
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

exports.packageDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var packageExists = await packageModel.findOne({_id: req.body.id, deleted_at: null});

        if(packageExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var details = await packageModel.updateOne({_id: req.body.id},{$set :req.body});

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

exports.getPackages = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_packages();

        var packageList = await packageModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < packageList.length; i++)
        {
            let details = await get_package_info(packageList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                packages : result,
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

exports.getPackageById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var packageList = await packageModel.findOne({_id: id, deleted_at: null}), result = null;

        if(packageList)
        {
            result = await get_package_info(packageList);
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

exports.getPackageByCategoryId = async(req,res,next) => {
    try {
        const id = req.params.id;

        var packageList = await packageModel.find({category_id: id, deleted_at: null}), result = [];

        for(let i = 0; i < packageList.length; i++)
        {
            let details = await get_package_info(packageList[i]);
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

exports.getEnablePackages = async(req,res,next) => {
    try {
        var packageList = await packageModel.find({deleted_at: null, is_enable: 1}).sort({_id: -1}), result = [];

        for(let i = 0; i < packageList.length; i++)
        {
            let details = await get_package_info(packageList[i]);
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

async function count_packages() {
    const count = await packageModel.find({deleted_at: null}).count();
    return count;
}

async function get_package_info(data) {
    let result = "";
    if(data)
    {
        let parent_info = await categoryModel.findOne({_id: data.category_id, deleted_at: null}).select(["name","description","is_enable"]).sort({id: -1});

        result = {
            _id: data._id,
            title: data.title,
            description: data.description != undefined && data.description != null && data.description != "" ? data.description : null,
            image: data.image != undefined && data.image != null && data.image != "" ? data.image : null,
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" ? data.is_enable : 0,
            show_in_frontend: data.show_in_frontend != undefined && data.show_in_frontend != null && data.show_in_frontend != "" ? data.show_in_frontend : 0,
            time: data.time != undefined && data.time != null && data.time != "" && data.time > 0 ? data.time : 0,
            charge: data.charge != undefined && data.charge != null && data.charge != "" && data.charge > 0 ? data.charge : 0,
            category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && parent_info != null ? data.category_id : null,
            category_name: parent_info != null ? parent_info.name : null,
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}

module.exports.get_package_info = get_package_info;