const categoryModel = require('../../model/category');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../categoryController');
const userController = require('../authController');
const logger = require('../../utils/logger').logger;

exports.getCategoryList = async(req,res,next) => {
    try {
        var categoryList = await categoryModel.find({deleted_at: null, parent_id: null, is_enable: 1}), result = [];

        for(let i = 0; i < categoryList.length; i++)
        {
            let details = await get_category_info(categoryList[i]);
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
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.getSubCategoryList = async(req,res,next) => {
    try {
        var parent_id = req.params.id;
        var categoryList = await categoryModel.find({deleted_at: null, parent_id: parent_id, is_enable: 1}), result = [];

        for(let i = 0; i < categoryList.length; i++)
        {
            let details = await get_category_info(categoryList[i]);
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
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

async function get_category_info(data) {
    let result = "";
    if(data)
    {
        let parent_info = await categoryModel.findOne({_id: data.parent_id, deleted_at: null}).select(["name","description","is_enable","cat_image"]).sort({id: -1}); 
        result = {
            _id: data._id,
            name: data.name,
            description: data.description != undefined && data.description != null && data.description != "" ? data.description : null,
            image: data.image != undefined && data.image != null && data.image != "" ? data.image : null,
            cat_image: data.cat_image != undefined && data.cat_image != null && data.cat_image != "" && data.cat_image.length > 0 ? data.cat_image : [],
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" ? data.is_enable : null,
            has_parent: data.has_parent != undefined && data.has_parent != null && data.has_parent != "" ? data.has_parent : null,
            is_parent_deleted: data.is_parent_deleted != undefined && data.is_parent_deleted != null && data.is_parent_deleted != "" ? data.is_parent_deleted : null,
            parent_id: data.parent_id != undefined && data.parent_id != null && data.parent_id != "" && parent_info != null ? data.parent_id : null,
            parent_name: parent_info != null ? parent_info : null,
            position: data.position,
            child_category: await get_child_category_info(data._id),
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}

async function get_child_category_info(parent_id) {
    var categoryList = await categoryModel.find({deleted_at: null, parent_id: parent_id}), result = [];

    for(let i = 0; i < categoryList.length; i++)
    {
        let details = await get_category_info(categoryList[i]);
        result.push(details);
    }

    return result;
}

module.exports.get_category_info = get_category_info;