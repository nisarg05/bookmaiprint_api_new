const categoryModel = require('../../model/category');
const questionModel = require('../../model/question');
const answerModel = require('../../model/answer');
const priceListModel = require('../../model/priceList');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../categoryController');
const questionController = require('../questionController');
const answerController = require('../answerController');
const priceListController = require('../priceListController');
const userController = require('../authController');
const logger = require('../../utils/logger').logger;

exports.getQuestionList = async(req,res,next) => {
    try {
        let category_id = req.params.id;
        var questionList = await questionModel.find({deleted_at: null, is_enable: 1, has_answer: 0, category_id: category_id}), result = [];

        for(let i = 0; i < questionList.length; i++)
        {
            let details = await questionController.get_question_info(questionList[i]);
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

exports.getQuestionListByParent = async(req,res,next) => {
    try {
        let answer_id = req.params.id, has_question = 0;
        var SelfquestionListData = await answerModel.find({deleted_at: null, is_enable: 1, has_answer: 1, _id: answer_id});
       
        var questionList = await questionModel.find({deleted_at: null, is_enable: 1, has_answer: 1, answer_id: answer_id}), result = [];
        if(questionList.length > 0)
        {
            has_question = 1;
        }

        if(has_question == 1)
        {
            for(let i = 0; i < questionList.length; i++)
            {
                let details = await questionController.get_question_info(questionList[i]);
                result.push(details);
            }
        }
        else
        {
            let details = await priceListController.get_price_by_answer(answer_id);
            for(let i = 0; i < details.length; i++)
            {
                result.push(details[i]);
            }
        }
       
        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: result,
            has_question: has_question,
            Selected_option: SelfquestionListData
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