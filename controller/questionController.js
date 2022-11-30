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

exports.questionCreate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        
        const newQuestion = new questionModel(
            {
                question: req.body.question,
                category_id: mongoose.Types.ObjectId(req.body.category_id),
                answer_id: req.body.answer_id != undefined && req.body.answer_id != "undefined" && req.body.answer_id != null && req.body.answer_id != "null" && req.body.answer_id != "" ? mongoose.Types.ObjectId(req.body.answer_id) : null,
                has_answer: req.body.has_answer != undefined && req.body.has_answer != null && req.body.has_answer == 1 || req.body.has_answer == '1' ? 1 : 0,
                is_enable: req.body.is_enable != undefined && req.body.is_enable != null && req.body.is_enable == 1 || req.body.is_enable == '1' ? 1 : 0,
                created_at: new Date().getTime(),
                created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
            }
        )

        await newQuestion.save();

        if(req.body.answer_id != undefined && req.body.answer_id != "undefined" && req.body.answer_id != null && req.body.answer_id != "null" && req.body.answer_id != "")
        {
            await answerModel.updateOne({_id: req.body.answer_id},{$set :{has_question: 1, updated_at: new Date().getTime(), updated_by: mongoose.Types.ObjectId(user_id)}})

            let answerMapInfo = await questionAnswerMapModel.findOne({answer_id: req.body.answer_id});

            if(answerMapInfo)
            {
                const newQuestionAnswerMap = new questionAnswerMapModel(
                    {
                        question_id: newQuestion._id,
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
                        question_id: newQuestion._id,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )
        
                await newQuestionAnswerMap.save();
            }
        }
        else
        {
            const newQuestionAnswerMap = new questionAnswerMapModel(
                {
                    question_id: newQuestion._id,
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )
    
            await newQuestionAnswerMap.save();
        }

        let details = await get_question_info(newQuestion);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY,
            data: details
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

exports.questionUpdate = async(req,res,next) => {
    try {
        var answerIdError = false, answer_id = null;

        if(req.body.has_answer != undefined && req.body.has_answer != null && req.body.has_answer == 1 || req.body.has_answer == '1')
        {
            if(req.body.answer_id == null || req.body.answer_id == "" || req.body.answer_id == undefined){answerIdError = true;}
        }

        if(req.body.answer_id != null && req.body.answer_id != "null" && req.body.answer_id != "" && req.body.answer_id != undefined && req.body.answer_id != "undefined"){answer_id = req.body.answer_id;}

        req.body.answer_id = answer_id;

        if(answerIdError == true)
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ANSWER_NOT_EXISTS
            })
        }
        else
        {
            let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

            var categoryExists = await categoryModel.findOne({_id: req.body.category_id, deleted_at: null});

            if(categoryExists)
            {
                req.body.updated_at = new Date().getTime();
                req.body.updated_by = mongoose.Types.ObjectId(user_id);

                var details = await questionModel.updateOne({_id: req.body.id},{$set :req.body});

                let childOptions = await answerModel.find({question_id: req.body.id});
                if(childOptions.length > 0)
                {
                    for(let j = 0; j < childOptions.length; j++)
                    {
                        await answerModel.updateOne({_id: childOptions[j]._id},{$set :{category_id: mongoose.Types.ObjectId(req.body.category_id), updated_at: new Date().getTime(), updated_by: mongoose.Types.ObjectId(user_id)}});
                    }
                }

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

exports.questionDelete = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var questionExists = await questionModel.findOne({_id: req.body.id, deleted_at: null});

        if(questionExists)
        {
            req.body.deleted_at = new Date().getTime();
            req.body.deleted_by = mongoose.Types.ObjectId(user_id);

            var answerCount = 0;
            if(questionExists.has_answer == 1 && questionExists.answer_id != null)
            {
                var answerCount = await questionModel.count({answer_id: questionExists.answer_id, deleted_at: null});
            }

            if(answerCount > 1)
            {
                var details = await questionModel.updateOne({_id: req.body.id},{$set :req.body});
            }
            else
            {
                var details = await questionModel.updateOne({_id: req.body.id},{$set :req.body});
                await answerModel.updateOne({_id: questionExists.answer_id},{$set :{has_question: 0, updated_at: new Date().getTime(), updated_by: mongoose.Types.ObjectId(user_id)}})
            }
            //var details = await questionModel.updateOne({_id: req.body.id},{$set :req.body});

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_DELETE_SUCCESSFULLY
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

exports.questionStatusDisable = async(req,res,next) => {
    try {
        let questionList = await questionAnswerMapModel.findOne({question_id:req.body.id})
        if(questionList)
        {
            let question_data = await disable_childs_question(req.body.id)
            
            res.status(200).json({
                status: message.messages.TRUE,
                message: message.messages.DATA_GET_SUCCESSFULLY,
                data: question_data
            })
        }
        else
        {
            res.status(200).json({
                status: message.messages.TRUE,
                message: message.messages.DATA_GET_SUCCESSFULLY,
                data: []
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

exports.questionStatusEnable = async(req,res,next) => {
    try {
        let questionList = await questionAnswerMapModel.findOne({question_id:req.body.id})

        if(questionList)
        {
            let question_data = await enable_childs_question(req.body.id)

            console.log("question_data",question_data)
            
            res.status(200).json({
                status: message.messages.TRUE,
                message: message.messages.DATA_GET_SUCCESSFULLY,
                data: question_data
            })
        }
        else
        {
            res.status(200).json({
                status: message.messages.TRUE,
                message: message.messages.DATA_GET_SUCCESSFULLY,
                data: []
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

exports.questionStateUpdate = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        var questionExists = await questionModel.findOne({_id: req.body.id, deleted_at: null});

        if(questionExists)
        {
            req.body.updated_at = new Date().getTime();
            req.body.updated_by = mongoose.Types.ObjectId(user_id);

            var details = await questionModel.updateOne({_id: req.body.id},{$set :req.body});

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

exports.getQuestions = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 20;
        var count = await count_qustions();

        var questionList = await questionModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < questionList.length; i++)
        {
            let details = await get_question_info(questionList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                questions : result,
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
exports.searchQuestionsHandler = async(req,res,next) => {
    try {
        const page = req.params.search_question;
        const limit = 3;

        var count
    
        count  = await count_qustions();

        var questionList = await questionModel.find({deleted_at: null}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];

        for(let i = 0; i < questionList.length; i++)
        {
            let details = await get_question_info(questionList[i]);
            result.push(details);
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                questions : result,
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
exports.getQuestionsAdmin = async(req,res,next) => {
    try {
        const page = req.params.page;
        const limit = 3;
      

        var count = await count_qustions(req.body.name);
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

        // var questionList = await questionModel.find({deleted_at: null,question: { $regex : '.*'+ req.body.name + '.*', $options: 'i' }}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];
        
        var questionList = await questionModel.find({deleted_at: null,question: { $regex : '.*'+ req.body.name + '.*', $options: 'i' }}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];
          console.log(questionList);
        for(let i = 0; i < questionList.length; i++)
        {
            let details = await get_question_info_admin(questionList[i]);
            console.log(questionList[i].vender_id.includes(mongoose.Types.ObjectId(user_id)), user_id, questionList[i].vender_id)
            if(questionList[i].vender_id.includes(mongoose.Types.ObjectId(user_id))) {
                details['is_vender_enable'] = 1
            } else {
                details['is_vender_enable'] = 0
            }
            result.push(details);
        }
        console.log("--details", result.length);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                questions : result,
                totalPages : Math.ceil(count / limit),
                currentPage : page,
                count: count,
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

exports.filterQuestions = async(req,res,next) => {
    try {
        
        const page = req.params;
        var quetion_name = (req.query.search);
        const limit = 20;
        var count = await count_qustions();
      
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;

       // var questionList = await questionModel.find({},result = []);
        // var questionList = await questionModel.find({deleted_at: null,question: { $regex : '.*'+ quetion_name, $options: 'i' }}).skip((page - 1)).sort({_id: -1}), result = [];
        var questionList = await questionModel.find({deleted_at: null,question: { $regex : '.*'+ quetion_name, $options: 'i' }}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = [];
 
        for(let i = 0; i < questionList.length; i++)
        {
            let details = await get_question_info_admin(questionList[i]);
            console.log(questionList[i].vender_id.includes(mongoose.Types.ObjectId(user_id)), user_id, questionList[i].vender_id)
            if(questionList[i].vender_id.includes(mongoose.Types.ObjectId(user_id))) {
                details['is_vender_enable'] = 1
            } else {
                details['is_vender_enable'] = 0
            }
            result.push(details);
        }
        console.log("--details", result.length);
        console.log("--details", result);
        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                questions : result,
                totalPages : Math.ceil(count ),
                currentPage : page
            }
        })
  
}
    // try{
    //     const data = await questionModel.find();
    //     res.status(200).json({
    //         status:message.messages.TRUE,
    //         message:message.messages.DATA_GET_SUCCESSFULLY,
    //         data: {
    //             questions : data,
    //             // totalPages : Math.ceil(count / limit),
    //             // currentPage : page
    //         }
    //     })
    // }

    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}

 

exports.getQuestionById = async(req,res,next) => {
    try {
        const id = req.params.id;

        var questionList = await questionModel.findOne({_id: id, deleted_at: null});

        let details = await get_question_info(questionList);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: details
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

exports.getQuestionByIdAdmin = async(req,res,next) => {
    try {
        const id = req.params.id;

        var questionList = await questionModel.findOne({_id: id, deleted_at: null});

        let details = await get_question_info_admin(questionList);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: details
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

async function count_qustions(searchstring="") {
    if(searchstring==""){
        const count = await questionModel.find({deleted_at: null}).count();
        return count;
    }
    else
    {
        const count = await questionModel.find({deleted_at: null,question:searchstring}).count();
        return count;
    }
   
}

async function get_question_info(data) {
    let result = "";
    if(data)
    {
        let optionResult = [];
        let parent_info = await answerModel.findOne({_id: data.answer_id, deleted_at: null, is_enable: 1}).select(["option"]).sort({_id: -1}); 

        let category_info = await categoryModel.findOne({_id: data.category_id, deleted_at: null}).select(["name","description","is_enable","parent_id"]).sort({_id: -1}), child_info = null; 
        if(category_info)
        {
            child_info = await categoryModel.findOne({_id: category_info.parent_id, deleted_at: null}).select(["name","description","is_enable"]).sort({_id: -1});
        }

        let answer_info = await answerModel.find({question_id: data._id, deleted_at: null, is_enable: 1}).select(["option","has_question","has_price","parent_question_id","image"]).sort({_id: -1});

        for(let i = 0; i < answer_info.length; i++)
        {
            let details = {
                "_id": answer_info[i]._id,
                "option": answer_info[i].option,
                "image": answer_info[i].image != undefined && answer_info[i].image != "undefined" && answer_info[i].image != null && answer_info[i].image != "null" && answer_info[i].image != "" ? answer_info[i].image : "",
                "has_question": answer_info[i].has_question != undefined && answer_info[i].has_question != null && answer_info[i].has_question != "" && answer_info[i].has_question == 1 || answer_info[i].has_question == '1' ? 1 : 0,
                "has_price": answer_info[i].has_price != undefined && answer_info[i].has_price != null && answer_info[i].has_price != "" && answer_info[i].has_price == 1 || answer_info[i].has_price == '1' ? 1 : 0,
                "parent_question_id": answer_info[i].parent_question_id != undefined && answer_info[i].parent_question_id != null && answer_info[i].parent_question_id != "" ? answer_info[i].parent_question_id : null,
                price_list: await priceListController.get_price_by_answer(answer_info[i]._id)
            };
            optionResult.push(details);
        }

        result = {
            _id: data._id,
            question: data.question,
            category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && child_info != null ? child_info._id : null,
            sub_category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && category_info != null ? data.category_id : null,
            category_name: child_info != null ? child_info : null,
            sub_category_name: category_info != null ? category_info : null,
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" ? data.is_enable : null,
            has_answer: data.has_answer != undefined && data.has_answer != null && data.has_answer != "" ? data.has_answer : null,
            answer_id: data.answer_id != undefined && data.answer_id != null && data.answer_id != "" && parent_info != null ? data.answer_id : null,
            answer: parent_info != null ? parent_info.option : null,
            options: answer_info != null ? optionResult : [],
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}

async function get_question_info_admin(data) {
    let result = "";
    if(data)
    {
        let optionResult = [];
        let parent_info = await answerModel.findOne({_id: data.answer_id, deleted_at: null}).select(["option","question_id"]).sort({_id: -1}); 

        let category_info = await categoryModel.findOne({_id: data.category_id, deleted_at: null}).select(["name","description","is_enable","parent_id"]).sort({_id: -1}), child_info = null; 
        if(category_info)
        {
            child_info = await categoryModel.findOne({_id: category_info.parent_id, deleted_at: null}).select(["name","description","is_enable"]).sort({_id: -1});
        }

        let answer_info = await answerModel.find({question_id: data._id, deleted_at: null}).select(["option","has_question","has_price","parent_question_id","image"]).sort({_id: -1});

        let parent_question_info = null;
        if(parent_info != null)
        {
            let parent_ans_ques_info = await questionModel.findOne({_id: parent_info.question_id})
            if(parent_ans_ques_info)
            {
                parent_question_info = parent_ans_ques_info.question
            }
        }

        for(let i = 0; i < answer_info.length; i++)
        {
            let details = {
                "_id": answer_info[i]._id,
                "option": answer_info[i].option,
                "image": answer_info[i].image != undefined && answer_info[i].image != "undefined" && answer_info[i].image != null && answer_info[i].image != "null" && answer_info[i].image != "" ? answer_info[i].image : "",
                "has_question": answer_info[i].has_question != undefined && answer_info[i].has_question != null && answer_info[i].has_question != "" && answer_info[i].has_question == 1 || answer_info[i].has_question == '1' ? 1 : 0,
                "has_price": answer_info[i].has_price != undefined && answer_info[i].has_price != null && answer_info[i].has_price != "" && answer_info[i].has_price == 1 || answer_info[i].has_price == '1' ? 1 : 0,
                "parent_question_id": answer_info[i].parent_question_id != undefined && answer_info[i].parent_question_id != null && answer_info[i].parent_question_id != "" ? answer_info[i].parent_question_id : null,
                price_list: await priceListController.get_price_by_answer(answer_info[i]._id)
            };

            optionResult.push(details);
        }

        result = {
            _id: data._id,
            question: data.question,
            category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && child_info != null ? child_info._id : null,
            sub_category_id: data.category_id != undefined && data.category_id != null && data.category_id != "" && category_info != null ? data.category_id : null,
            category_name: child_info != null ? child_info : null,
            sub_category_name: category_info != null ? category_info : null,
            is_enable: data.is_enable != undefined && data.is_enable != null && data.is_enable != "" ? data.is_enable : null,
            has_answer: data.has_answer != undefined && data.has_answer != null && data.has_answer != "" ? data.has_answer : null,
            answer_id: data.answer_id != undefined && data.answer_id != null && data.answer_id != "" && parent_info != null ? data.answer_id : null,
            answer: parent_info != null ? parent_info.option : null,
            parent_question_info: parent_question_info,
            options: answer_info != null ? optionResult : [],
            created_at: userController.changeDateFormat(data.created_at),
            deleted_at: data.deleted_at != null ? userController.changeDateFormat(data.deleted_at) : null
        }
    }

    return result;
}

async function disable_childs_answer(id){
    let questionList = await questionAnswerMapModel.find({parent_id:id})
    let result = [];

    if(questionList.length > 0)
    {
        for(let i = 0; i < questionList.length; i++){
            var ansdetails = await answerModel.updateOne({_id: questionList[i].answer_id},{$set :{is_enable:0}});

            let child_info = [];
            let questionInfo = await questionAnswerMapModel.find({parent_id:questionList[i]._id})
            if(questionInfo.length > 0)
            {
                for(let j = 0; j < questionInfo.length; j++){
                    var details = await questionModel.updateOne({_id: questionInfo[j].question_id},{$set :{is_enable:0}});
                    let obj = {
                        question_id: questionInfo[j].question_id,
                        answer_id: questionInfo[j].answer_id,
                        parent_id: questionInfo[j].parent_id,
                        child_data: await disable_childs_answer(questionInfo[j]._id)
                    }
                    child_info.push(obj)
                }
            }
            let objResu = {
                question_id: questionList[i].question_id,
                answer_id: questionList[i].answer_id,
                parent_id: questionList[i].parent_id,
                child_data: child_info
            }
            result.push(objResu)
        }
    }

    return result
}

async function disable_childs_question(id){
    let result = [];
    let questionList = await questionAnswerMapModel.findOne({question_id:id})
    if(questionList)
    {
        var details = await questionModel.updateOne({_id: id},{$set :{is_enable:0}});
        let obj = {
            question_id: questionList.question_id,
            answer_id: questionList.answer_id,
            parent_id: questionList.parent_id,
            child_data: await disable_childs_answer(questionList._id)
        }
        result.push(obj);
    }
    return result
}

async function enable_childs_answer(id, resultData){
    let questionList = await questionAnswerMapModel.find({parent_id:id})

    let result = resultData, status = false;
    
    if(questionList.length > 0)
    {
        for(let i = 0; i < questionList.length; i++)
        {
            if(questionList[i].answer_id != null && questionList[i].answer_id != "null" && questionList[i].answer_id != undefined && questionList[i].answer_id != "undefined" && questionList[i].answer_id != "")
            {
                let findAns = await answerModel.findOne({_id: questionList[i].answer_id, has_price: 1})
                if(findAns)
                {
                    status = true;
                    result.push(questionList[i]._id);
                }
                else
                {
                    status = await enable_childs_answer(questionList[i]._id, result);
                    //result.push(questionList[i]._id);
                }
            }
            else
            {
                status = await enable_childs_answer(questionList[i]._id, result);
                //result.push(questionList[i]._id);
            }
        }
    }
    else
    {
        status = false;
    }

    return result
}

async function enable_childs_question(id){
    let result = [];
    let questionList = await questionAnswerMapModel.findOne({question_id:id})
    if(questionList)
    {
        console.log("questionList._id",questionList._id)

        let result = await enable_childs_answer(questionList._id, [])

        console.log("result",result)
        if(result.length > 0)
        {
            let enabledResut = await enable_hierarchy(result);
        }
    }
    return true;
}

async function enable_hierarchy(data){
    if(data.length > 0)
    {
        for(let i = 0; i < data.length; i++)
        {
            let parent_question = await questionAnswerMapModel.findOne({_id:data[i]})

            if(parent_question.answer_id != null && parent_question.answer_id != "null" && parent_question.answer_id != undefined && parent_question.answer_id != "undefined" && parent_question.answer_id != ""){
                var ansdetails = await answerModel.updateOne({_id: parent_question.answer_id},{$set :{is_enable:1}});
            }
            else{
                var details = await questionModel.updateOne({_id: parent_question.question_id},{$set :{is_enable:1}});
            }

            if(parent_question.parent_id != null && parent_question.parent_id != "null" && parent_question.parent_id != undefined && parent_question.parent_id != "undefined" && parent_question.parent_id != "")
            {
                let enable_hierarchy_data = await enable_hierarchy([parent_question.parent_id]);
            }
        }
    }

    return true;
}

module.exports.get_question_info = get_question_info;
module.exports.enable_childs_question = enable_childs_question;