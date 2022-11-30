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

const menuModel = require('../model/menu');
const pageModel = require('../model/page');
const howWeWorkModel = require('../model/howWeWork');

exports.howWeWorkCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let file = "";

        if(req.file && req.file.destination){
            console.log("req.file.filename",req.file.filename)
            await sharp(req.file.path)
            .resize(200, 200, {fit: sharp.fit.outside})
            .toFile('uploads/'+req.file.filename);
            fs.unlinkSync(req.file.path);

            file = 'uploads/'+req.file.filename;
        }
        
        const newHowWeWork = new howWeWorkModel(
            {
                image: file,
                title: req.body.title != null && req.body.title != "null" && req.body.title != undefined && req.body.title != "undefined" && req.body.title != "" ? req.body.title : "",
                description: req.body.description != null && req.body.description != "null" && req.body.description != undefined && req.body.description != "undefined" && req.body.description != "" ? req.body.description : "",
                created_at: new Date().getTime(),
                created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
            }
        )

        await newHowWeWork.save();

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

exports.howWeWorkUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var howWeWorkExists = await howWeWorkModel.findOne({_id: req.body.id, deleted_at: null});

        if(howWeWorkExists)
        {
            let file = "";

            if(req.file && req.file.destination){
                await sharp(req.file.path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.file.filename);
                fs.unlinkSync(req.file.path);

                if(howWeWorkExists.image != undefined && howWeWorkExists.image != null && howWeWorkExists.image != "null" && howWeWorkExists.image != ""){
                    fs.unlinkSync(howWeWorkExists.image)
                }

                file = 'uploads/'+req.file.filename;
            }
            else
            {
                file = howWeWorkExists.image;
            }

            req.body.image = file;
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await howWeWorkModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.HOW_WE_WORK_NOT_EXISTS
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

exports.howWeWorkDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var howWeWorkExists = await howWeWorkModel.findOne({_id: req.body.id, deleted_at: null});

        if(howWeWorkExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var details = await howWeWorkModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.HOW_WE_WORK_NOT_EXISTS
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

exports.getHowWeWork = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_how_we_work();

        var howWeWorkList = await howWeWorkModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                result : howWeWorkList,
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

exports.getHowWeWorkWithoutPagination = async(req,res,next) => {
    try {
        var howWeWorkList = await howWeWorkModel.find({deleted_at: null}).sort({_id: -1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: howWeWorkList
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

exports.getHowWeWorkById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var howWeWorkList = await howWeWorkModel.findOne({_id: id, deleted_at: null});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: howWeWorkList
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

async function count_how_we_work() {
    const count = await howWeWorkModel.find({deleted_at: null}).count();
    return count;
}