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

exports.menuCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let settingInfo = await menuModel.findOne({slug: req.body.slug, title: req.body.title, deleted_at: null})

        if(settingInfo)
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.MENU_ALREADY_EXISTS
            })
        }
        else
        {
            const newMenu = new menuModel(
                {
                    slug: req.body.slug != null && req.body.slug != "null" && req.body.slug != undefined && req.body.slug != "undefined" && req.body.slug != "" ? req.body.slug : "",
                    title: req.body.title != null && req.body.title != "null" && req.body.title != undefined && req.body.title != "undefined" && req.body.title != "" ? req.body.title : "",
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )

            await newMenu.save();

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

exports.menuUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let settingInfo = await menuModel.findOne({_id: req.body.id, deleted_at: null})

        if(settingInfo)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await menuModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.MENU_NOT_EXISTS
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

exports.menuDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var menuExists = await menuModel.findOne({_id: req.body.id, deleted_at: null});

        if(menuExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            let childPages = await pageModel.find({menu_id: menuExists._id});
            if(childPages.length > 0)
            {
                for(let j = 0; j < childPages.length; j++)
                {
                    await pageModel.updateOne({_id: childPages[j]._id},{$set :req.body});
                }
            }

            var details = await menuModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.MENU_NOT_EXISTS
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

exports.getMenu = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_menues();

        var menuList = await menuModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                menu : menuList,
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

exports.getMenuWithoutPagination = async(req,res,next) => {
    try {
        var menuList = await menuModel.find({deleted_at: null}).sort({_id: -1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: menuList
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

exports.getMenuById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var menuList = await menuModel.findOne({_id: id, deleted_at: null});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: menuList
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

exports.menuStatusEnable = async(req,res,next) => {
    try {
        const id = req.body.id;

        var menuList = await menuModel.findOne({_id: id, deleted_at: null});

        if(menuList)
        {
            let countPage = await pageModel.count({menu_id: menuList._id, deleted_at: null})

            if(countPage > 0)
            {
                req.body.is_enable = 1;
                req.body.updated_at = new Date().getTime();
                req.body.updated_by = mongoose.Types.ObjectId(user_id);

                var details = await menuModel.updateOne({_id: req.body.id},{$set :req.body});

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_UPDATE_SUCCESSFULLY
                })
            }
            else
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.PAGE_INSERT
                })
            }
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.MENU_NOT_EXISTS
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

exports.menuStatusDisable = async(req,res,next) => {
    try {
        const id = req.body.id;

        var menuList = await menuModel.findOne({_id: id, deleted_at: null});

        if(menuList)
        {
            req.body.is_enable = 0;
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await menuModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.MENU_NOT_EXISTS
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

exports.getEnabledMenu = async(req,res,next) => {
    try {
        var menuList = await menuModel.find({deleted_at: null, is_enable: 1}).sort({_id: -1});

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: menuList
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

async function count_menues() {
    const count = await menuModel.find({deleted_at: null}).count();
    return count;
}