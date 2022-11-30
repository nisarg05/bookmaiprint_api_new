const userModel = require('../model/user');
const categoryModel = require('../model/category');
const questionModel = require('../model/question');
const answerModel = require('../model/answer');
const questionAnswerMapModel = require('../model/question_answer_map');

const userController = require('../controller/authController');
const priceListController = require('../controller/priceListController');

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

const rootQuestionController = require('../controller/rootQuestionController');

exports.answerCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        let file = "";

        if(req.file && req.file.destination){
            await sharp(req.file.path)
            //.resize(200, 200, {fit: sharp.fit.outside})
            .toFile('uploads/'+req.file.filename);
            fs.unlinkSync(req.file.path);

            file = 'uploads/'+req.file.filename;
        }

        var questionList = await questionModel.findOne({_id: req.body.question_id, deleted_at: null});

        if(questionList)
        {
            const newAnswer = new answerModel(
                {
                    question_id: mongoose.Types.ObjectId(req.body.question_id),
                    category_id: mongoose.Types.ObjectId(questionList.category_id),
                    option: req.body.option,
                    image: file,
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )

            await newAnswer.save();

            let answerMapInfo = await questionAnswerMapModel.findOne({question_id: req.body.question_id});

            if(answerMapInfo)
            {
                const newQuestionAnswerMap = new questionAnswerMapModel(
                    {
                        answer_id: newAnswer._id,
                        parent_id: answerMapInfo._id,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )
        
                await newQuestionAnswerMap.save();
            }
            else
            {
                const newQuestionAnswerMap = new questionAnswerMapModel(
                    {
                        answer_id: newAnswer._id,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )
        
                await newQuestionAnswerMap.save();
            }

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY,
                data:newAnswer
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.QUESTION_NOT_EXISTS
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

exports.answerUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var answerExists = await answerModel.findOne({_id: req.body.id, deleted_at: null});

        if(answerExists)
        {
            let file = "";

            if(req.file && req.file.destination){
                await sharp(req.file.path)
                .resize(200, 200, {fit: sharp.fit.outside})
                .toFile('uploads/'+req.file.filename);
                fs.unlinkSync(req.file.path);

                if(answerExists.image != undefined && answerExists.image != null && answerExists.image != "null" && answerExists.image != ""){
                    fs.unlinkSync(answerExists.image)
                }

                file = 'uploads/'+req.file.filename;
            }
            else
            {
                file = req.body.image == "null" || req.body.image == null ? "" : req.body.image;
            }

            req.body.image = file;
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await answerModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ANSWER_NOT_EXISTS
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

exports.answerDelete = async(req,res,next) => { 
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var answerExists = await answerModel.findOne({_id: req.body.id, deleted_at: null});

        if(answerExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var details = await answerModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ANSWER_NOT_EXISTS
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

exports.getAnswerByQuestion = async(req,res,next) => {
    try {
        let question_id = req.params.id;

        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var questionExists = await questionModel.findOne({_id: req.body.question_id, deleted_at: null});

        if(questionExists)
        {
            var details = await answerModel.find({question_id: req.body.question_id, is_enable: 1}).select(["option","parent_question_id"]).sort({id: -1})

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY,
                data: details
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.QUESTION_NOT_EXISTS
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

exports.getAnswerById = async(req,res,next) => {
    try {
        let answer_id = req.params.id;

        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var answerExists = await answerModel.findOne({_id: answer_id, deleted_at: null}), result = [];

        if(answerExists)
        {
            var answerList = await answerModel.findOne({_id: answer_id}).sort({_id: -1})
            let details = await get_answer_info(answerList);

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY,
                data: details
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.QUESTION_NOT_EXISTS
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

exports.getParentQuestionAnswer = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        
        var categoryExists = await categoryModel.findOne({_id: mongoose.Types.ObjectId(req.body.category_id), deleted_at: null});

        if(categoryExists)
        {
            var answerList = await answerModel.find({category_id: mongoose.Types.ObjectId(req.body.category_id), has_price: 0}).sort({id: -1}), result = [];

            for(let i = 0; i < answerList.length; i++)
            {
                let details = await get_answer_info(answerList[i]);
                if(details != null && details != "")
                {
                    //let rootQuestion = await rootQuestionController.rootDetails(details._id, []);
                    result.push(details);
                }
            }

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY,
                data: result
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.QUESTION_NOT_EXISTS
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

exports.getRootQuestionAnswer = async(req,res,next) => {
    try {
        let rootQuestion = await rootQuestionController.rootDetails(req.body.id, []);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: rootQuestion
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

async function get_answer_info(data) {
    let result = "";
    if(data)
    {
        let parent_info = await categoryModel.findOne({_id: data.category_id, deleted_at: null}).select(["name","description","is_enable","parent_id"]).sort({_id: -1}), child_info = null; 
        if(parent_info)
        {
            console.log("parent_info",parent_info.parent_id);
            child_info = await categoryModel.findOne({_id: parent_info.parent_id, deleted_at: null}).select(["name","description","is_enable"]).sort({_id: -1});
        }
        let question_info = await questionModel.findOne({_id: data.question_id, deleted_at: null}).select(["question"]).sort({_id: -1});
        let priceList = await priceListController.get_price_by_answer(data._id);

        if(question_info)
        {
            result = {
                _id: data._id,
                option: data.option,
                image: data.image != undefined && data.image != "undefined" && data.image != null && data.image != "null" && data.image != "" ? data.image : "",
                category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && child_info != null ? child_info._id : null,
                sub_category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && parent_info != null ? data.category_id : null,
                category_name: child_info != null ? child_info : null,
                sub_category_name: parent_info != null ? parent_info : null,
                question_id: data.question_id != undefined && data.question_id != null && data.question_id != "" && question_info != null ? data.question_id : null,
                question: question_info != null ? question_info : null,
                has_question: data.has_question != undefined && data.has_question != null && data.has_question != "" && data.has_question == 1 || data.has_question == '1' ? 1 : 0,
                parent_question_id: data.parent_question_id != undefined && data.parent_question_id != null && data.parent_question_id != "" ? data.parent_question_id : null,
                has_price: data.has_price != undefined && data.has_price != null && data.has_price != "" && data.has_price == 1 || data.has_price == '1' ? 1 : 0,
                price_list: priceList,
                created_at: userController.changeDateFormat(data.created_at),
                deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
            }
        }
    }

    return result;
}

async function rootDetails(leafId,rootList){
    let parents = await questionModel.findById(leafId)
   // console.log('parents:',rootList)
    if(parents!=null && parents!='' && parents){
        rootList.push(parents.question);
       // console.log('parents.answer_id',parents.answer_id)
        if(parents.answer_id!=null && parents.answer_id!=''){
            await rootDetails(parents.answer_id,rootList)
        }else{
            console.log(rootList)
            return rootList.reverse();
        } 
    }else{
        let parentAns = await answerModel.findById(leafId)
        rootList.push(parentAns.option);
        await rootDetails(parentAns.question_id,rootList)
    }
}

module.exports.get_answer_info = get_answer_info;