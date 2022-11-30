const couponCodeModel = require('../../model/couponCode');
const categoryModel = require('../../model/category');
const questionModel = require('../../model/question');
const answerModel = require('../../model/answer');
const priceListModel = require('../../model/priceList');
const orderModel = require('../../model/order');
const addressModel = require('../../model/address');
const cartModel = require('../../model/cart');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../categoryController');
const questionController = require('../questionController');
const answerController = require('../answerController');
const priceListController = require('../priceListController');
const orderTimeLineController = require('../api/orderTimeLineController');
const userController = require('../authController');
const user = require('../../model/user');
const logger = require('../../utils/logger').logger;

exports.insertCart = async(req,res,next) => {
    try{
        let user_id = req.user == null || req.user == "" || req.user == "null" ? null : mongoose.Types.ObjectId(req.user.user_id);

        if(user_id == null)
        {
            let userDetails = await user.findOne({mobile_no: req.body.mobile_no});
            if(userDetails)
            {
                user_id = mongoose.Types.ObjectId(userDetails._id);
            }
            else
            {
                if(req.body.mobile_no != undefined && req.body.mobile_no != null)
                {
                    const newUser = new user(
                        {
                            mobile_no: req.body.mobile_no
                        }
                    );
        
                    await newUser.save();
                    user_id = mongoose.Types.ObjectId(newUser._id);
                }
            }
        }

        if(user_id != null)
        {
            //var existingCart = await cartModel.findOne({category_id: mongoose.Types.ObjectId(req.body.category_id), question_id: mongoose.Types.ObjectId(req.body.question_id), answer_id: mongoose.Types.ObjectId(req.body.answer_id), price_list_id: mongoose.Types.ObjectId(req.body.price_list_id), user_id: user_id, deleted_at: null});

            const newCart = new cartModel(
                {
                    category_id: mongoose.Types.ObjectId(req.body.category_id),
                    // question_id: mongoose.Types.ObjectId(req.body.question_id),
                    // answer_id: mongoose.Types.ObjectId(req.body.answer_id),
                    price_list_id: mongoose.Types.ObjectId(req.body.price_list_id),
                    user_id: mongoose.Types.ObjectId(user_id),
                    question_list: req.body.question_list,
                    created_at: new Date().getTime(),
                    created_by: mongoose.Types.ObjectId(user_id)
                }
            );

            await newCart.save();

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
            })
        }
    }catch(err){
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}

exports.getCart = async(req,res,next) => {
    try
    {
        let user_id = req.user == null || req.user == "" || req.user == "null" ? null : mongoose.Types.ObjectId(req.user.user_id);

        if(user_id == null)
        {
            let userDetails = await user.findOne({mobile_no: req.body.mobile_no});
            if(userDetails)
            {
                user_id = mongoose.Types.ObjectId(userDetails._id);
            }

            if(user_id)
            {
                var cartDetails = await cart.find({user_id: user_id, deleted_at: null}).sort({created_at: -1})
                var result = [], total_amount = 0;

                for (const details of cartDetails) {
                    var category_details = [], question_details = [], answer_details = [], price_list_details = [];

                    category_info = await categoryModel.findOne(details.category_id);
                    category_details = await categoryController.get_category_info(category_info);

                    // question_info = await questionModel.findOne(details.question_id);
                    // question_details = await questionController.get_question_info(question_info);

                    // answer_info = await answerModel.findOne(details.answer_id);
                    // answer_details = await answerController.get_answer_info(answer_info);

                    price_list_info = await priceListModel.findOne(details.price_list_id);
                    price_list_details = await priceListController.get_price_info(price_list_info);

                    var obj = {
                        _id : details._id,
                        category_id : details.category_id,
                        // question_id : details.question_id,
                        // answer_id : details.answer_id,
                        price_list_id : details.price_list_id,
                        category_info : category_details,
                        // question_info : question_details,
                        // answer_info : answer_details,
                        price_list_info : price_list_details,
                        question_list: details.question_list,
                        total_price : price_list_details != null && price_list_details.price != undefined && price_list_details.price != "" ? price_list_details.price : 0
                    }
        
                    result.push(obj);
                }

                var filtered = result.filter(function (el) {
                    return el.category_info != null && el.category_info != "";
                });

                for (const details of filtered) {
                    total_amount = total_amount + details.total_price;
                }
    
                product_total_amount = total_amount;

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_GET_SUCCESSFULLY,
                    data: {
                        item : filtered,
                        product_total_amount : product_total_amount,
                        total_payable_amount : total_amount
                    }
                })
            }
            else
            {
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_GET_SUCCESSFULLY,
                    data: {
                        item : [],
                        product_total_amount : 0,
                        total_payable_amount : 0
                    }
                })
            }
        }
    }
    catch(err)
    {
        console.log("err",err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}

exports.deleteCart = async(req,res,next) => {
    try
    {
        let user_id = req.user == null || req.user == "" || req.user == "null" ? null : mongoose.Types.ObjectId(req.user.user_id);

        if(user_id == null)
        {
            let userDetails = await user.findOne({mobile_no: req.body.mobile_no});
            if(userDetails)
            {
                user_id = mongoose.Types.ObjectId(userDetails._id);
            }

            if(user_id)
            {
                req.body.deleted_at = new Date().getTime();
                req.body.deleted_by = mongoose.Types.ObjectId(user_id);

                var cartDetails = await cartModel.findOneAndUpdate({_id: req.body.id}, {$set :req.body})

                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_DELETE_SUCCESSFULLY
                })
            }
            else
            {
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_DELETE_SUCCESSFULLY
                })
            }
        }
    }
    catch(err)
    {
        console.log("err",err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}