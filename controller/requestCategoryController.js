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

const vendorModel = require('../model/vendorRegister');
const requestCategoryModel = require('../model/requestCategory');

exports.categoryList = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_categories();

        var categoryList = await requestCategoryModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < categoryList.length; i++)
        {
            let details = await category_details(categoryList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                category : result,
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

async function user_details(id) {
    var categoryExists = await requestCategoryModel.findOne({_id: id}), details = null;
    if(categoryExists)
    {
        let vendorName = "", venderEmail = "", vendorCompanyName = "";
        let vendorExists = await vendorModel.findOne({_id: categoryExists.vendor_id});
        if(vendorExists)
        {
            vendorName = vendorExists.first_name+" "+vendorExists.last_name;
            venderEmail = vendorExists.email;
            vendorCompanyName = vendorExists.company_name;
        }

        details = {
            _id: categoryExists._id,
            vendor_name: vendorName,
            vendor_email: venderEmail,
            vendor_company_name: vendorCompanyName,
            category_name: categoryExists.category_name != undefined && categoryExists.category_name != null && categoryExists.category_name != "" ? categoryExists.category_name : "",
            created_at: changeDateFormat(categoryExists.created_at),
            deleted_at: categoryExists.deleted_at != null ? changeDateFormat(categoryExists.deleted_at) : null
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

async function count_categories() {
    const count = await requestCategoryModel.find({deleted_at: null}).count();
    return count;
}