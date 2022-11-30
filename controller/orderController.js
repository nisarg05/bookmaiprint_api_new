const couponCodeModel = require('../model/couponCode');
const categoryModel = require('../model/category');
const questionModel = require('../model/question');
const answerModel = require('../model/answer');
const priceListModel = require('../model/priceList');
const orderModel = require('../model/order');
const addressModel = require('../model/address');
const otpModel = require('../model/otp');
const orderDetailsModel = require('../model/orderDetails');
const orderStatusModel = require('../model/orderStatus');
const orderStatusDetailsModel = require('../model/orderStatusDetails');
const uploadModel = require('../model/upload');
const packageModel = require('../model/package');
const deliveryChargeModel = require('../model/deliveryCharge');

const message = require('../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../controller/categoryController');
const priceListController = require('../controller/priceListController');
const userOrderTimelineController = require('../controller/api/orderTimeLineController');
const userController = require('../controller/authController');
const user = require('../model/user');

const invoiceController = require('../controller/invoiceController');

const mailFunction = require('../config/mail');
exports.orderStatusAdmin = async(req,res,next) => {
    try{
        let user_id = mongoose.Types.ObjectId(req.user.user_id);
       
        let orderInfo = await orderModel.findOne({_id: req.body.id});

        if(orderInfo)
        {
            let paymentStatusInfo = "payment_success";
            if(req.body.payment_status != null || req.body.payment_status != "" || req.body.payment_status != undefined)
            {
                paymentStatusInfo = req.body.payment_status;
            }

            let obj = {
                status: req.body.status,
                payment_status: paymentStatusInfo
            }
            
            orderModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body.id)}, obj, {upsert: true}, function(err, doc) {
                if (err)
                {
                    res.status(400).json({
                        status:message.messages.FALSE,
                        message:message.messages.SOMETHING_WENT_WRONG
                    })
                }
            });

            const newOrderStatus = new orderStatusModel(
                {
                    user_id: mongoose.Types.ObjectId(orderInfo.user_id),
                    order_id: mongoose.Types.ObjectId(orderInfo._id),
                    status: req.body.status,
                    is_detailed_status: 0,
                    payment_status: paymentStatusInfo,
                    message: "",
                    created_by: mongoose.Types.ObjectId(orderInfo.user_id)
                }
            );
        
            await newOrderStatus.save();

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.ORDER_STATUS
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ORDER_NOT_FOUND
            })
        }
    }catch(err){
        // console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

// exports.orderDetailsStatusAdmin = async(req,res,next) => {
//     try{
//         let user_id = mongoose.Types.ObjectId(req.user.user_id);
//         let orderInfo = await orderDetailsModel.findOne({_id: req.body.id});

//         if(orderInfo)
//         {
//             let paymentStatusInfo = "payment_success";
//             if(req.body.payment_status != null || req.body.payment_status != "" || req.body.payment_status != undefined)
//             {
//                 paymentStatusInfo = req.body.payment_status;
//             }

//             let obj = {
//                 status: req.body.status,
//                 payment_status: paymentStatusInfo
//             }
            
//             // orderModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body.id)}, obj, {upsert: true}, function(err, doc) {
//             //     if (err)
//             //     {
//             //         res.status(400).json({
//             //             status:message.messages.FALSE,
//             //             message:message.messages.SOMETHING_WENT_WRONG
//             //         })
//             //     }
//             // });

//             let mainOrderInfo = await orderModel.findOne({_id: orderInfo.order_id})

//             let objUpdate = {
//                 user_id: orderInfo.user_id,
//                 order_id: mainOrderInfo._id,
//                 status: req.body.status,
//                 payment_status: paymentStatusInfo,
//                 message: "",
//                 is_deliver_same_address: mainOrderInfo.is_deliver_same_address != undefined && mainOrderInfo.is_deliver_same_address != "undefined" && mainOrderInfo.is_deliver_same_address != null && mainOrderInfo.is_deliver_same_address != "null" && mainOrderInfo.is_deliver_same_address != "" && mainOrderInfo.is_deliver_same_address > 0 ? 1 : 0,
//             };

//             // let addOrderStatus = await userOrderTimelineController.insert_order_status(objUpdate);

//             const newOrderStatus = new orderStatusModel(
//                 {
//                     user_id: mongoose.Types.ObjectId(orderInfo.user_id),
//                     order_id: mongoose.Types.ObjectId(orderInfo.order_id),
//                     status: null,
//                     is_detailed_status: 1,
//                     payment_status: paymentStatusInfo,
//                     message: "",
//                     created_by: mongoose.Types.ObjectId(orderInfo.user_id)
//                 }
//             );
        
//             await newOrderStatus.save();

//             const newOrderStatusDetails = new orderStatusDetailsModel(
//                 {
//                     order_status_id: mongoose.Types.ObjectId(newOrderStatus._id),
//                     order_detail_id: mongoose.Types.ObjectId(orderInfo._id),
//                     status: req.body.status,
//                     message: "",
//                     created_by: mongoose.Types.ObjectId(orderInfo.user_id)
//                 }
//             );
        
//             await newOrderStatusDetails.save();

//             let mainOrderStatusInfo = await order_details(orderInfo.order_id, req.body.status);

//             if(mainOrderStatusInfo == true)
//             {
//                 orderModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(orderInfo.order_id)}, obj, {upsert: true}, function(err, doc) {
//                     if (err)
//                     {
//                         res.status(400).json({
//                             status:message.messages.FALSE,
//                             message:message.messages.SOMETHING_WENT_WRONG
//                         })
//                     }
//                 });
//             }

//             res.status(200).json({
//                 status:message.messages.TRUE,
//                 message:message.messages.ORDER_STATUS
//             })
//         }
//         else
//         {
//             res.status(400).json({
//                 status:message.messages.FALSE,
//                 message:message.messages.ORDER_NOT_FOUND
//             })
//         }
//     }catch(err){
//         // console.log(err);
//         res.status(400).json({
//             status:message.messages.FALSE,
//             message:message.messages.SOMETHING_WENT_WRONG
//         })
//     }
// }

exports.orderDetailsStatusAdmin = async(req,res,next) => {
    try{
        let user_id = mongoose.Types.ObjectId(req.user.user_id);
        let orderInfo = await orderModel.findOne({_id: req.body.id});

        let paymentStatusInfo = "payment_success";
        if(req.body.payment_status != null || req.body.payment_status != "" || req.body.payment_status != undefined)
        {
            paymentStatusInfo = req.body.payment_status;
        }

        if(orderInfo)
        {
            const newOrderStatus = new orderStatusModel(
                {
                    user_id: mongoose.Types.ObjectId(orderInfo.user_id),
                    order_id: mongoose.Types.ObjectId(orderInfo._id),
                    status: null,
                    is_detailed_status: 1,
                    payment_status: paymentStatusInfo,
                    message: "",
                    created_by: mongoose.Types.ObjectId(orderInfo.user_id)
                }
            );
        
            await newOrderStatus.save();

            for(let i = 0; i < req.body.status.length; i++)
            {
                let orderDetailsInfo = await orderDetailsModel.findOne({_id: req.body.status[i].id});
                
                let checkAlreadyExists = await orderStatusDetailsModel.findOne({order_detail_id: mongoose.Types.ObjectId(orderDetailsInfo._id), status: req.body.status[i].status})

                if(checkAlreadyExists)
                {
                    var details = await orderStatusDetailsModel.updateOne({order_detail_id: mongoose.Types.ObjectId(orderDetailsInfo._id), status: req.body.status[i].status},{$set : {deleted_at: new Date().getTime(), deleted_by: mongoose.Types.ObjectId(user_id)}});
                }

                const newOrderStatusDetails = new orderStatusDetailsModel(
                    {
                        order_status_id: mongoose.Types.ObjectId(newOrderStatus._id),
                        order_detail_id: mongoose.Types.ObjectId(orderDetailsInfo._id),
                        status: req.body.status[i].status,
                        message: "",
                        created_by: mongoose.Types.ObjectId(orderInfo.user_id)
                    }
                );
            
                await newOrderStatusDetails.save();
            }

            var details = await orderModel.updateOne({_id: req.body.id},{$set : {status: req.body.order_status, payment_status: paymentStatusInfo}});
            var userExists = await user.findOne({_id: mongoose.Types.ObjectId(orderInfo.user_id)});
         
            await mailFunction.send_mail(userExists.email, "Order Update", "Your Order "+details.invoice_no+" status has update new Status : "+req.body.order_status);
            console.log("user oder detail: ........",userExists);
              res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.ORDER_STATUS
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.ORDER_NOT_FOUND
            })
        }
    }catch(err){
        console.log("111111111",err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

async function order_details(order_id, status) {
    let orderDetailsInfo = await orderDetailsModel.find({order_id:order_id, deleted_at: null})
    let orderStatusDetails = [];
    for(let i = 0; i < orderDetailsInfo.length; i++)
    {
        orderStatusDetails = await orderStatusDetailsModel.find({order_detail_id: orderDetailsInfo._id, status: status})
    }

    var orderStatus = false;
    if(orderDetailsInfo.length === orderStatusDetails.length)
    {
        orderStatus = true;
    }

    return orderStatus;
}