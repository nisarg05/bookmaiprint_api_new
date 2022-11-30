const packageModel = require('../../model/package');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const packageController = require('../packageController');
const logger = require('../../utils/logger').logger;

exports.getHomePagePackageList = async(req,res,next) => {
    try {
        var packageList = await packageModel.find({deleted_at: null, show_in_frontend: 1, is_enable: 1}), result = [];

        for(let i = 0; i < packageList.length; i++)
        {
            let details = await packageController.get_package_info(packageList[i]);
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

exports.getPackageList = async(req,res,next) => {
    try {
        let condition = {
            deleted_at: null,
            is_enable: 1
        }

        if(req.body.category_id != undefined && req.body.category_id != "undefined" && req.body.category_id != null && req.body.category_id != "null" && req.body.category_id != "")
        {
            condition.category_id = req.body.category_id;
        }

        if(req.body.show_in_frontend != undefined && req.body.show_in_frontend != "undefined" && req.body.show_in_frontend != null && req.body.show_in_frontend != "null" && req.body.show_in_frontend != "" && req.body.show_in_frontend == 1 || req.body.show_in_frontend == "1" || req.body.show_in_frontend == true || req.body.show_in_frontend == "true")
        {
            condition.show_in_frontend = 1;
        }

        console.log("condition",condition);

        var packageList = await packageModel.find(condition), result = [];

        for(let i = 0; i < packageList.length; i++)
        {
            let details = await packageController.get_package_info(packageList[i]);
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