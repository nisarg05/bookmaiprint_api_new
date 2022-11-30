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

const settingModel = require('../model/setting');

exports.settingCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let settingInfo = null
        
        if(req.body.id != undefined && req.body.id != null && req.body.id != "undefined" && req.body.id != "null" && req.body.id != "")
        {
            settingInfo = await settingModel.findOne({_id: req.body.id})
        }

        if(settingInfo != null)
        {
            let file = "", footer_file = "";
    
            if(req.files && req.files.logo != undefined && req.files.logo != "undefined" && req.files.logo != null && req.files.logo != "null" && req.files.logo.length > 0){
                await sharp(req.files.logo[0].path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.files.logo[0].filename);
                fs.unlinkSync(req.files.logo[0].path);

                if(settingInfo.logo != undefined && settingInfo.logo != null && settingInfo.logo != "null" && settingInfo.logo != ""){
                    fs.unlinkSync(settingInfo.logo)
                }

                file = 'uploads/'+req.files.logo[0].filename;
            }
            else{
                file = settingInfo.logo
            }

            if(req.files && req.files.footer_logo != undefined && req.files.footer_logo != "undefined" && req.files.footer_logo != null && req.files.footer_logo != "null" && req.files.footer_logo.length > 0){
                await sharp(req.files.footer_logo[0].path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.files.footer_logo[0].filename);
                fs.unlinkSync(req.files.footer_logo[0].path);

                if(settingInfo.footer_logo != undefined && settingInfo.footer_logo != null && settingInfo.footer_logo != "null" && settingInfo.footer_logo != ""){
                    fs.unlinkSync(settingInfo.footer_logo)
                }

                footer_file = 'uploads/'+req.files.footer_logo[0].filename;
            }
            else{
                footer_file = settingInfo.footer_logo
            }

            req.body.logo = file;
            req.body.footer_logo = footer_file;
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await settingModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            let file = "", footer_file = "";
    
            if(req.files && req.files.logo != undefined && req.files.logo != "undefined" && req.files.logo != null && req.files.logo != "null" && req.files.logo.length > 0){
                await sharp(req.files.logo[0].path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.files.logo[0].filename);
                fs.unlinkSync(req.files.logo[0].path);

                file = 'uploads/'+req.files.logo[0].filename;
            }

            if(req.files && req.files.footer_logo != undefined && req.files.footer_logo != "undefined" && req.files.footer_logo != null && req.files.footer_logo != "null" && req.files.footer_logo.length > 0){
                await sharp(req.files.footer_logo[0].path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.files.footer_logo[0].filename);
                fs.unlinkSync(req.files.footer_logo[0].path);

                footer_file = 'uploads/'+req.files.footer_logo[0].filename;
            }

            const newSettingsData = new settingModel(
                {
                    logo: file,
                    description: req.body.description != null && req.body.description != "null" && req.body.description != undefined && req.body.description != "undefined" && req.body.description != "" ? req.body.description : "",
                    sort_description: req.body.sort_description != null && req.body.sort_description != "null" && req.body.sort_description != undefined && req.body.sort_description != "undefined" && req.body.sort_description != "" ? req.body.sort_description : "",
                    upload_file_description: req.body.upload_file_description != null && req.body.upload_file_description != "null" && req.body.upload_file_description != undefined && req.body.upload_file_description != "undefined" && req.body.upload_file_description != "" ? req.body.upload_file_description : "",
                    subscription_description: req.body.subscription_description != null && req.body.subscription_description != "null" && req.body.subscription_description != undefined && req.body.subscription_description != "undefined" && req.body.subscription_description != "" ? req.body.subscription_description : "",
                    footer_logo: footer_file,
                    footer_descrption: req.body.footer_descrption != null && req.body.footer_descrption != "null" && req.body.footer_descrption != undefined && req.body.footer_descrption != "undefined" && req.body.footer_descrption != "" ? req.body.footer_descrption : "",
                    footer_copy_rights: req.body.footer_copy_rights != null && req.body.footer_copy_rights != "null" && req.body.footer_copy_rights != undefined && req.body.footer_copy_rights != "undefined" && req.body.footer_copy_rights != "" ? req.body.footer_copy_rights : "",
                    linked_in_link: req.body.linked_in_link != null && req.body.linked_in_link != "null" && req.body.linked_in_link != undefined && req.body.linked_in_link != "undefined" && req.body.linked_in_link != "" ? req.body.linked_in_link : "",
                    twitter_link: req.body.twitter_link != null && req.body.twitter_link != "null" && req.body.twitter_link != undefined && req.body.twitter_link != "undefined" && req.body.twitter_link != "" ? req.body.twitter_link : "",
                    facebook_link: req.body.facebook_link != null && req.body.facebook_link != "null" && req.body.facebook_link != undefined && req.body.facebook_link != "undefined" && req.body.facebook_link != "" ? req.body.facebook_link : "",
                    tax: req.body.tax != null && req.body.tax != "null" && req.body.tax != undefined && req.body.tax != "undefined" && req.body.tax != "" && req.body.tax > 0 ? req.body.tax : 0,
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )

            await newSettingsData.save();

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

exports.getSetting = async(req,res,next) => {
    try {
        var settingList = await settingModel.findOne({});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: settingList
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