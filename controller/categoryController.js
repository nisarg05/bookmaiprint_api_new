const userModel = require('../model/user');
const categoryModel = require('../model/category');
const questionModel = require('../model/question');
const priceListModel = require('../model/priceList');

const userController = require('../controller/authController');
const questionController = require('../controller/questionController');

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

exports.categoryCreate = async(req,res,next) => {
    try {
        var parentIdError = false;

        if(req.body.has_parent != undefined && req.body.has_parent != null && req.body.has_parent == 1 || req.body.has_parent == '1')
        {
            if(req.body.parent_id == null || req.body.parent_id == "" || req.body.parent_id == undefined){parentIdError = true;}
        }

        if(parentIdError == true)
        {    
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.CATEGORY_NOT_EXISTS
            })
        }
        else
        {
            let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

            let file = "", category_images = [];

            if(req.files && req.files.icon != undefined && req.files.icon != "undefined" && req.files.icon != null && req.files.icon != "null" && req.files.icon.length > 0){
                await sharp(req.files.icon[0].path)
                //.resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.files.icon[0].filename);
                fs.unlinkSync(req.files.icon[0].path);

                file = 'uploads/'+req.files.icon[0].filename;
            }

            if(req.files && req.files.category_image != undefined && req.files.category_image != "undefined" && req.files.category_image != null && req.files.category_image != "null" && req.files.category_image.length > 0){
                for(let i = 0; i < req.files.category_image.length; i++)
                {
                    await sharp(req.files.category_image[i].path)
                    //.resize(200, 200, {fit: sharp.fit.outside})
                    .toFile('uploads/'+req.files.category_image[i].filename);
                    fs.unlinkSync(req.files.category_image[i].path);

                    category_images.push('uploads/'+req.files.category_image[i].filename);
                }
            }

            var categoryExists = await categoryModel.findOne({name: req.body.name, deleted_at: null});

            if(categoryExists)
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.CATEGORY_NAME_EXISTS
                })
            }
            else
            {
                const newCategory = new categoryModel(
                    {
                        name: req.body.name,
                        description: req.body.description,
                        image: file,
                        cat_image: category_images,
                        is_enable: req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0,
                        has_parent: req.body.has_parent != undefined && req.body.has_parent != null && req.body.has_parent == 1 || req.body.has_parent == '1' ? 1 : 0,
                        parent_id: req.body.parent_id != undefined && req.body.parent_id != "undefined" && req.body.parent_id != null && req.body.parent_id != "null" && req.body.parent_id != '' ? mongoose.Types.ObjectId(req.body.parent_id) : null,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )

                await newCategory.save();

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_ADD_SUCCESSFULLY
                })
            }
        }
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

exports.categoryUpdate = async(req,res,next) => {
    try {
        var parentIdError = false, parent_id = null;category_images = []

        if(req.body.has_parent != undefined && req.body.has_parent != null && req.body.has_parent == 1 || req.body.has_parent == '1')
        {
            if(req.body.parent_id == null || req.body.parent_id == "" || req.body.parent_id == undefined){parentIdError = true;}
        }

        if(req.body.parent_id != null && req.body.parent_id != "null" && req.body.parent_id != "" && req.body.parent_id != undefined && req.body.parent_id != "undefined"){parent_id = req.body.parent_id;}

        req.body.parent_id = parent_id;

        if(parentIdError == true)
        {    
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.CATEGORY_NOT_EXISTS
            })
        }
        else
        {
            let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

            var categoryExists = await categoryModel.findOne({_id: req.body.id, deleted_at: null});

            if(categoryExists)
            {
                let file = "";

                // if(req.file && req.file.destination){
                //     await sharp(req.file.path)
                //     .resize(200, 200, {fit: sharp.fit.outside})
                //     .toFile('uploads/'+req.file.filename);
                //     fs.unlinkSync(req.file.path);

                //     if(categoryExists.image != undefined && categoryExists.image != null && categoryExists.image != "null" && categoryExists.image != ""){
                //         fs.unlinkSync(categoryExists.image)
                //     }

                //     file = 'uploads/'+req.file.filename;
                // }
                // else
                // {
                //     file = req.body.icon == "null" || req.body.icon == null ? "" : req.body.icon;
                // }

                //console.log(req.files,"req.files");

                if(req.files && req.files.icon != undefined && req.files.icon != "undefined" && req.files.icon != null && req.files.icon != "null" && req.files.icon != undefined && req.files.icon.length > 0){
                    await sharp(req.files.icon[0].path)
                    //.resize(200, 200, {fit: sharp.fit.outside})
                    .toFile('uploads/'+req.files.icon[0].filename);
                    fs.unlinkSync(req.files.icon[0].path);

                    if(categoryExists.image != undefined && categoryExists.image != null && categoryExists.image != "null" && categoryExists.image != ""){
                        fs.unlinkSync(categoryExists.image)
                    }
    
                    file = 'uploads/'+req.files.icon[0].filename;
                }
                else
                {
                    file = req.body.icon == "null" || req.body.icon == null ? "" : req.body.icon;
                }

                if(req.files && req.files.category_image != undefined && req.files.category_image != "undefined" && req.files.category_image != null && req.files.category_image != "null" && req.files.category_image.length > 0){
                    for(let i = 0; i < req.files.category_image.length; i++)
                    {
                        await sharp(req.files.category_image[i].path)
                        //.resize(200, 200, {fit: sharp.fit.outside})
                        .toFile('uploads/'+req.files.category_image[i].filename);
                        fs.unlinkSync(req.files.category_image[i].path);
    
                        category_images.push('uploads/'+req.files.category_image[i].filename);
                    }
                }else {
                    category_images = categoryExists.cat_image;
                }


                req.body.image = file;
                req.body['cat_image'] = category_images,
                req.body.updated_at = new Date().getTime();
                req.body.updated_by = mongoose.Types.ObjectId(user_id);
                
                console.log(req.body,"test");
                
                req.body.is_enable != "" && req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable != "undefined" && req.body.is_enable != "null" && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0;

                if(req.body.is_enable != "" && req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable != "undefined" && req.body.is_enable != "null")
                {
                    let childCategories = await categoryModel.find({parent_id: req.body.id});
                    if(childCategories.length > 0)
                    {
                        for(let j = 0; j < childCategories.length; j++)
                        {
                            let childQuestion = await questionModel.find({category_id: childCategories[j]._id});
                            if(childQuestion.length > 0)
                            {
                                for(let j = 0; j < childQuestion.length; j++)
                                {
                                    await questionModel.updateOne({_id: childQuestion[j]._id},{$set :{
                                        updated_at: new Date().getTime(),
                                        updated_by: mongoose.Types.ObjectId(user_id),
                                        is_enable: req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0
                                    }});
                                }
                            }

                            await categoryModel.updateOne({_id: childCategories[j]._id},{$set :{
                                updated_at: new Date().getTime(),
                                updated_by: mongoose.Types.ObjectId(user_id),
                                is_enable: req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0
                            }});
                        }
                    }
                }

                var details = await categoryModel.updateOne({_id: req.body.id},{$set :req.body});

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

exports.categoryStatus = async(req,res,next) => {
    try {
            let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

            var categoryExists = await categoryModel.findOne({_id: req.body.id, deleted_at: null});

            if(categoryExists)
            {
                req.body.updated_at = new Date().getTime();
                req.body.updated_by = mongoose.Types.ObjectId(user_id);
                
                req.body.is_enable= req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0;

                let childCategories = await categoryModel.find({parent_id: req.body.id});
                if(childCategories.length > 0)
                {
                    for(let j = 0; j < childCategories.length; j++)
                    {
                        let childQuestion = await questionModel.find({category_id: childCategories[j]._id});
                        if(childQuestion.length > 0)
                        {
                            for(let j = 0; j < childQuestion.length; j++)
                            {
                                await questionModel.updateOne({_id: childQuestion[j]._id},{$set :req.body});
                            }
                        }

                        await categoryModel.updateOne({_id: childCategories[j]._id},{$set :req.body});
                    }
                }

                var details = await categoryModel.updateOne({_id: req.body.id},{$set :req.body});

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

exports.categoryEnableStatus = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var categoryExists = await categoryModel.findOne({_id: req.body.id, deleted_at: null});

        if(categoryExists)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);
            
            req.body.is_enable= req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0;

            let resultFinal = [];
            var childCategories
            if(categoryExists.has_parent == 1){
                childCategories = await categoryModel.find({_id: req.body.id});
            }else{
                childCategories = await categoryModel.find({parent_id: req.body.id});
            }
            console.log("childCategories",childCategories)
            if(childCategories.length > 0)
            {
                for(let j = 0; j < childCategories.length; j++)
                {
                    let results = [];
                    let questionList = await questionModel.find({category_id: childCategories[j]._id});

                    for(let i = 0; i < questionList.length; i++)
                    {
                        let questionStatus = await questionController.enable_childs_question(questionList[i]._id)
                        console.log(questionStatus)
                        results.push(questionStatus)
                    }

                    if(results.includes(true))
                    {
                        var details = await categoryModel.updateOne({_id: childCategories[j]._id},{$set :req.body});

                        resultFinal.push(true);
                    }
                }   
            }


            if(resultFinal.includes(true))
            {
                var details = await categoryModel.updateOne({_id: req.body.id},{$set :req.body});

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.CATEGORY_ENABLE
                })
            }
            else
            {
                res.status(200).json({
                    status:message.messages.FALSE,
                    message:message.messages.CATEGORY_NOT_QUESTION_EXISTS
                })
            }
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

exports.categoryDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var categoryExists = await categoryModel.findOne({_id: req.body.id, deleted_at: null});

        if(categoryExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            let childCategories = await categoryModel.find({parent_id: req.body.id});
            if(childCategories.length > 0)
            {
                for(let j = 0; j < childCategories.length; j++)
                {
                    let childQuestion = await questionModel.find({category_id: childCategories[j]._id});
                    if(childQuestion.length > 0)
                    {
                        for(let j = 0; j < childQuestion.length; j++)
                        {
                            await questionModel.updateOne({_id: childQuestion[j]._id},{$set :req.body});
                        }
                    }

                    await categoryModel.updateOne({_id: childCategories[j]._id},{$set :req.body});
                }
            }

            var details = await categoryModel.updateOne({_id: req.body.id},{$set :req.body});

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

exports.getCategories = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_categoties();
        var where = {}
      //  where.deleted_at=null
        
        if(req.body.search?.keyword && req.body.search?.keyword!=""){

            where=[ {name :{$regex : req.body.search?.keyword} },  { description :{$regex : req.body.search?.keyword}}  ] ;
        }
        else
        {
            where=[ {deleted_at : null }] ;
        
        }
       
      



        var categoryList = await categoryModel.find( { $or:  where }).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];
     



      for(let i = 0; i < categoryList.length; i++)
        {
            let details = await get_category_info(categoryList[i]);
            result.push(details);
        }
        


        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                categories : result,
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

exports.getParentCategories = async(req,res,next) => {
    try {
        var categoryList = await categoryModel.find({deleted_at: null, has_parent: 0}).select(["name"]).sort({name: -1}), result = [];

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: categoryList
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

exports.getChildCategories = async(req,res,next) => {
    try {
        var categoryList = await categoryModel.find({parent_id: req.params.id, deleted_at: null}).select(["name"]).sort({name: -1}), result = [];

        console.log("categoryList",categoryList);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: categoryList
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

exports.getCategoryById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var categoryList = await categoryModel.findOne({_id: id, deleted_at: null}), result = null;

        if(categoryList)
        {
            result = await get_category_info(categoryList);
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

exports.getEnableParentCategories = async(req,res,next) => {
    try {
        var categoryList = await categoryModel.find({deleted_at: null, is_enable: 1, has_parent: 0}).select(["name"]).sort({name: -1}), result = [];

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: categoryList
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

exports.getEnableCategories = async(req,res,next) => {
    try {
        var categoryList = await categoryModel.find({deleted_at: null, is_enable: 1}).select(["name"]).sort({name: -1}), result = [];

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: categoryList
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

exports.getSearchSubCategories = async(req,res,next) => {
    try {
        const name = req.body.search;
        var categoryList = await categoryModel.find({deleted_at: null, is_enable: 1, name: {$regex: name, $options: 'i'}, has_parent: 1, parent_id: {$ne: null}}).sort({name: -1}), result = [];

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: categoryList
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

exports.addVendorQuestion = async(req, res, next) => {
    try {
        var str = await priceListModel.findOne({_id:req.body.id})
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        if (str) {
            var chnages = str.vendor

            const indexOfObject = chnages.findIndex(object => {
                return object.vendor_id.toString() === user_id.toString();
            });       
                        
            if(indexOfObject > -1)
            {
                chnages.splice(indexOfObject, 1);
            }

            chnages.push({"vendor_id":mongoose.Types.ObjectId(user_id),"price":req.body.price,"delivery_hours":req.body.deliveryHours,"is_active":req.body.is_active})
            //chnages.push(mongoose.Types.ObjectId(user_id))
            var update = await priceListModel.updateOne({_id:req.body.id},{$set:{vendor:chnages}})

            // console.log("req.body",req.body)
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }else {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.SOMETHING_WENT_WRONG
            })
        }
        console.log('str', str)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.removeVendorQuestion = async(req, res, next) => {
    try {
        var str = await questionModel.findOne({_id:req.body.id})
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        if (str) {
            var chnages = str.vender_id
            if (chnages.length > 0) {
                for (let k = 0; k < chnages.length; k++) {
                    console.log(chnages[k], mongoose.Types.ObjectId(user_id))
                    if(chnages[k].equals(mongoose.Types.ObjectId(user_id))) {
                        chnages.splice(k, 1)
                        console.log("yes")
                    }
                }
            }
            console.log('chnages',chnages)
            var update = await questionModel.updateOne({_id:req.body.id},{$set:{vender_id:chnages}})
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }else {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.SOMETHING_WENT_WRONG
            })
        }
        console.log('str', str)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

async function count_categoties() {
    const count = await categoryModel.find({deleted_at: null}).count();
    return count;
}

function float(equation, precision = 9) {
    return Math.floor(equation * (10 ** precision)) / (10 ** precision);
}

async function get_position(data) {
    let index = 1;
    if(data.has_parent == 1 || data.has_parent == '1')
    {
        let parentCategoryInfo = await categoryModel.findOne({_id: data.parent_id}).sort({_id: -1});
        if(parentCategoryInfo)
        {
            index = parseInt(parentCategoryInfo.position)+"."+1;
            let categoryInfo = await categoryModel.findOne({parent_id: data.parent_id}).sort({_id: -1});
            if(categoryInfo)
            {
                index = (float(parseFloat(categoryInfo.position) + 0.1));   
            }
        }
    }
    else
    {
        let categoryInfo = await categoryModel.findOne().sort({_id: -1});
        if(categoryInfo)
        {
            index = (parseInt(categoryInfo.position)+1);
        }
    }

    console.log("index",index);

    return index;
}

async function get_category_info(data) {
    let result = "", cat_image = [];
    if(data)
    {
        console.log('data:',data)
        if(data.cat_image != undefined && data.cat_image != "undefined" && data.cat_image != null && data.cat_image != "null" && data.cat_image.length > 0)
        {
            cat_image = data.cat_image
        }

        let parent_info = await categoryModel.findOne({_id: data.parent_id, deleted_at: null}).select(["name","description","is_enable"]).sort({_id: -1}).lean(); 
        console.log("======parent_info", parent_info);
        result = {
            _id: data._id,
            name: data.name,
            description: data.description != undefined && data.description != null && data.description != "" ? data.description : null,
            image: data.image != undefined && data.image != null && data.image != "" ? data.image : null,
            cat_image: cat_image,
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" ? data.is_enable : 0,
            has_parent: data.has_parent != undefined && data.has_parent != null && data.has_parent != "" ? data.has_parent : 0,
            is_parent_deleted: data.is_parent_deleted != undefined && data.is_parent_deleted != null && data.is_parent_deleted != "" ? data.is_parent_deleted : null,
            parent_id: data.parent_id != undefined && data.parent_id != null && data.parent_id != "" && parent_info != null ? data.parent_id : null,
            parent_name: parent_info != null ? parent_info : null,
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
        console.log("======result", result);
    }

    return result;
}

module.exports.get_category_info = get_category_info;
