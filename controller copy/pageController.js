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

const userController = require('../controller/authController');

const menuModel = require('../model/menu');
const pageModel = require('../model/page');

exports.pageCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let menuInfo = await menuModel.findOne({_id: req.body.menu_id, deleted_at: null})

        if(menuInfo)
        {
            let pageInfo = await pageModel.count({menu_id: req.body.menu_id, deleted_at: null})

            const newPage = new pageModel(
                {
                    title: req.body.title != null && req.body.title != "null" && req.body.title != undefined && req.body.title != "undefined" && req.body.title != "" ? req.body.title : "",
                    sort_description: req.body.sort_description != null && req.body.sort_description != "null" && req.body.sort_description != undefined && req.body.sort_description != "undefined" && req.body.sort_description != "" ? req.body.sort_description : "",
                    description: req.body.description != null && req.body.description != "null" && req.body.description != undefined && req.body.description != "undefined" && req.body.description != "" ? req.body.description : "",
                    menu_id: mongoose.Types.ObjectId(menuInfo._id),
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )

            await newPage.save();

            var details = await menuModel.updateOne({_id: menuInfo._id},{$set : {is_enable: 1, updated_at: new Date().getTime(), updated_by: mongoose.Types.ObjectId(user_id)}});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.MENU_ALREADY_EXISTS
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

exports.pageUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let pageInfo = await pageModel.findOne({_id: req.body.id, deleted_at: null})

        if(pageInfo)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await pageModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.PAGE_NOT_EXISTS
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

exports.pageDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var pageExists = await pageModel.findOne({_id: req.body.id, deleted_at: null});

        if(pageExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            let childPages = await menuModel.find({menu_id: menuExists._id});
            if(childPages.length > 0)
            {
                for(let j = 0; j < childPages.length; j++)
                {
                    await menuModel.updateOne({_id: childPages[j]._id},{$set : {is_enable: 0}});
                }
            }

            var details = await pageModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.PAGE_NOT_EXISTS
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

exports.getPage = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_pages(), result = [];

        var pageList = await pageModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1});

        for(let i = 0; i < pageList.length; i++)
        {
            let details = await get_page_info(pageList[i])
            result.push(details)
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                pages : result,
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

exports.getPageById = async(req,res,next) => {
    try {
        const id = req.params.id;
        let result = null;

        var menuList = await pageModel.findOne({_id: id, deleted_at: null});

        if(menuList)
        {
            result = await get_page_info(menuList)
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

exports.getPageBySlug = async(req,res,next) => {
    try {
        const slug = req.params.slug;
        let result = null;

        let pageSlugInfo = await menuModel.findOne({slug: slug, is_enable: 1, deleted_at: null});
        
        if(pageSlugInfo)
        {
            var menuList = await pageModel.findOne({menu_id: pageSlugInfo._id, deleted_at: null});

            if(menuList)
            {
                result = await get_page_info(menuList)
            }

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY,
                data: result,
                menuInfo: pageSlugInfo
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

async function get_page_info(data) {
    let result = "";
    if(data)
    {
        let parent_info = await menuModel.findOne({_id: data.menu_id, deleted_at: null}).lean(); 

        result = {
            _id: data._id,
            title: data.title,
            sort_description: data.sort_description != undefined && data.sort_description != null && data.sort_description != "" ? data.sort_description : null,
            description: data.description != undefined && data.description != null && data.description != "" ? data.description : null,
            menu_id: data.menu_id != undefined && data.menu_id != null && data.menu_id != "" && parent_info != null ? data.menu_id : null,
            parent_info: parent_info != null ? parent_info : null,
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}

async function count_pages() {
    const count = await pageModel.find({deleted_at: null}).count();
    return count;
}

module.exports.get_page_info = get_page_info;
