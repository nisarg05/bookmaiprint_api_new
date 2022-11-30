const uploadModel = require('../model/upload');

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

const orderDetailsModel = require('../model/orderDetails');

exports.uploadCreate = async(req,res,next) => {
    try {
        console.log("here");
        let file = "", file_name = "", upload_id = null;

        if(req.file && req.file.destination){
            console.log(req.file);

            file = 'uploads/'+req.file.filename;
            file_name = req.file.filename;
        }
        
        let newUploadModel = new uploadModel(
            {
                image: file,
                image_type: req.body.file_type,
                image_extention: req.body.file_ext,
                created_at: new Date().getTime()
            }
        )

        await newUploadModel.save();

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.FILE_UPLOAD_SUCCESSFULL,
            data:newUploadModel,
            file:file_name
        })
    }
    catch(error) {
        console.log("error",error.message);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}

exports.orderUploadImage = async(req,res,next) => {
    try {
        console.log("here");
        let file = "", file_name = "", upload_id = null;

        if(req.file && req.file.destination){
            console.log(req.file);

            file = 'uploads/'+req.file.filename;
            file_name = req.file.filename;
        }
        
        let newUploadModel = new uploadModel(
            {
                image: file,
                image_type: req.body.file_type,
                image_extention: req.body.file_ext,
                created_at: new Date().getTime()
            }
        )

        await newUploadModel.save();

        await orderDetailsModel.updateOne({_id: req.body.order_id},{$set :{
            upload_file_id: newUploadModel._id
        }});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.FILE_UPLOAD_SUCCESSFULL,
            data:newUploadModel,
            file:file_name
        })
    }
    catch(error) {
        console.log("error",error.message);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}

exports.uploadDelete = async(req,res,next) => {
    try {
        var uploadExists = await uploadModel.findOne({_id: req.body.id, deleted_at: null});
        if(uploadExists.image != undefined && uploadExists.image != "undefined" && uploadExists.image != null && uploadExists.image != "null" && uploadExists.image != ""){
            fs.unlinkSync(uploadExists.image);

            req.body.deleted_at = new Date().getTime();

            var details = await uploadModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
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