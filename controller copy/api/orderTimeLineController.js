const orderModel = require('../../model/order');
const orderDetailsModel = require('../../model/orderDetails');
const orderStatusModel = require('../../model/orderStatus');
const orderStatusDetailsModel = require('../../model/orderStatusDetails');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../categoryController');
const userController = require('../authController');
const logger = require('../../utils/logger').logger;

async function insert_order_status(data) {
    if(data.is_deliver_same_address != 1 && data.is_deliver_same_address != "1")
    {
        const newOrderStatus = new orderStatusModel(
            {
                user_id: mongoose.Types.ObjectId(data.user_id),
                order_id: mongoose.Types.ObjectId(data.order_id),
                status: null,
                is_detailed_status: 1,
                payment_status: data.payment_status,
                message: data.message,
                created_at: new Date().getTime(),
                created_by: mongoose.Types.ObjectId(data.user_id)
            }
        );
    
        await newOrderStatus.save();

        let orderDetailsInfo = await orderDetailsModel.find({order_id: data.order_id})
        console.clear();
        console.log("orderDetailsInfo",orderDetailsInfo.length);
        for(let i = 0; i < orderDetailsInfo.length; i++)
        {
            const newOrderStatusDetails = new orderStatusDetailsModel(
                {
                    order_status_id: mongoose.Types.ObjectId(newOrderStatus._id),
                    order_detail_id: mongoose.Types.ObjectId(orderDetailsInfo[i]._id),
                    status: data.status,
                    message: data.message,
                    created_at: new Date().getTime(),
                    created_by: mongoose.Types.ObjectId(data.user_id)
                }
            );
        
            await newOrderStatusDetails.save();
        }
    }
    else
    {
        const newOrderStatus = new orderStatusModel(
            {
                user_id: mongoose.Types.ObjectId(data.user_id),
                order_id: mongoose.Types.ObjectId(data.order_id),
                status: data.status,
                is_detailed_status: 0,
                payment_status: data.payment_status,
                message: data.message,
                created_at: new Date().getTime(),
                created_by: mongoose.Types.ObjectId(data.user_id)
            }
        );
    
        await newOrderStatus.save();
    }
    return true;
}

exports.orderStatusTimeLine = async(req,res,next) => {
    try
    {
        let user_id = mongoose.Types.ObjectId(req.user.user_id), order_id = mongoose.Types.ObjectId(req.params.id), result = [];

        let orderTimeline = await orderStatusModel.find({order_id: order_id, user_id: user_id}).sort({_id: -1});

        if(orderTimeline.length > 0)
        {
            for(let i = 0; i < orderTimeline.length; i++)
            {
                let status = null, orderDetailsStatus = [];
                if(orderTimeline[i].status != null)
                {
                    status = "Order Placed";

                    if(orderTimeline[i].status == "confirmed")
                    {
                        status = "Order Confirmed";
                    }
                    else if(orderTimeline[i].status == "payment_failed")
                    {
                        status = "Payment Failed";
                    }
                    else if(orderTimeline[i].status == "delivered")
                    {
                        status = "Delivered";
                    }
                    else if(orderTimeline[i].status == "cancelled")
                    {
                        status = "Order Cancelled";
                    }
                    else if(orderTimeline[i].status == "return")
                    {
                        status = "Order Return";
                    }
                    else if(orderTimeline[i].status == "in_transit")
                    {
                        status = "In Transit";
                    }
                }
                else{
                    let orderDetailsInfo = await orderDetailsModel.find({order_id: order_id})
                    for(let j = 0; j < orderDetailsInfo.length; j++)
                    {
                        let orderStatusDetailsInfo = await orderStatusDetailsModel.find({order_status_id: orderTimeline[i]._id, order_detail_id: orderDetailsInfo[j]}).sort({_id: -1});

                        let statusDetails = null
                        for(let k = 0; k < orderStatusDetailsInfo.length; k++)
                        {
                            statusDetails = "Order Placed";

                            if(orderStatusDetailsInfo[k].status == "confirmed")
                            {
                                statusDetails = "Order Confirmed";
                            }
                            else if(orderStatusDetailsInfo[k].status == "payment_failed")
                            {
                                statusDetails = "Payment Failed";
                            }
                            else if(orderStatusDetailsInfo[k].status == "delivered")
                            {
                                statusDetails = "Delivered";
                            }
                            else if(orderStatusDetailsInfo[k].status == "cancelled")
                            {
                                statusDetails = "Order Cancelled";
                            }
                            else if(orderStatusDetailsInfo[k].status == "return")
                            {
                                statusDetails = "Order Return";
                            }
                            else if(orderStatusDetailsInfo[k].status == "in_transit")
                            {
                                statusDetails = "In Transit";
                            }

                            let obj2 = {
                                status: statusDetails,
                                message: orderStatusDetailsInfo[k].message != null && orderStatusDetailsInfo[k].message != "" ? orderStatusDetailsInfo[k].message : "",
                                date: dateConvert(orderStatusDetailsInfo[k].created_at)
                            }
            
                            orderDetailsStatus.push(obj2);
                        }
                    }
                }

                let obj = {
                    status: status,
                    orderDetailsStatus: orderDetailsStatus,
                    payment_status: orderTimeline[i].payment_status,
                    message: orderTimeline[i].message != null && orderTimeline[i].message != "" ? orderTimeline[i].message : "",
                    date: dateConvert(orderTimeline[i].created_at)
                }

                result.push(obj);
            }
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data:result
        })
    }
    catch(err){
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

async function orderDetailsStatus(order_id) {
    let orderStatusInfo = await orderStatusDetailsModel.findOne({order_detail_id: order_id, deleted_at: null}).sort({_id: -1})

    return orderStatusInfo;
}

function dateConvert(timestamp) {
    var date = new Date(timestamp);

    return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

async function getOrderDetailsStatusTimeLine(order_id) {
    let timeline = [];

    let orderTimeline = await orderStatusDetailsModel.find({order_detail_id: order_id, deleted_at: null}).sort({_id: 1});
    
    //console.log("orderTimeline",order_id);
    // console.log("orderTimeline",orderTimeline);

    if(orderTimeline.length > 0)
    {
        for(let i = 0; i < orderTimeline.length; i++)
        {
            let orderStatusInfo = await orderStatusModel.findOne({_id: orderTimeline[i].order_status_id, deleted_at: null})

            let status = "Order Placed";

            if(orderTimeline[i].status == "confirmed")
            {
                status = "Order Confirmed";
            }
            else if(orderTimeline[i].status == "payment_failed")
            {
                status = "Payment Failed";
            }
            else if(orderTimeline[i].status == "delivered")
            {
                status = "Delivered";
            }
            else if(orderTimeline[i].status == "cancelled")
            {
                status = "Order Cancelled";
            }
            else if(orderTimeline[i].status == "return")
            {
                status = "Order Return";
            }
            else if(orderTimeline[i].status == "in_transit")
            {
                status = "In Transit";
            }

            let timelineobj = {
                status: status,
                flag: true,
                payment_status: orderStatusInfo != null && orderStatusInfo != "null" && orderStatusInfo != undefined && orderStatusInfo != "undefined" && orderStatusInfo != "" ? orderStatusInfo.payment_status : null,
                message: orderTimeline[i].message != null && orderTimeline[i].message != "" ? orderTimeline[i].message : "",
                date: dateConvert((parseInt(orderTimeline[i].created_at) + (5*60+30)*60000))
            }
            
            //console.log(orderTimeline[i])
            timeline.push(timelineobj);
        }
        if(orderTimeline[orderTimeline.length - 1].status == 'confirmed') {
            var str = {
                status: "Delivered",
                flag: false,
                payment_status: "",
                message:  "",
                date: ""
            }
            timeline.push(str);
        }else if (orderTimeline[orderTimeline.length - 1].status == 'pending') {
            var str = {
                status: "Order Confirmed",
                flag: false,
                payment_status: "",
                message:  "",
                date: ""
            }
            timeline.push(str);
            var str1 = {
                status: "Delivered",
                flag: false,
                payment_status: "",
                message:  "",
                date: ""
            }
            timeline.push(str1);
        }
    }

    return timeline;
}

async function getOrderStatusTimeLine(order_id) {
    let timeline = [];

    let orderTimeline = await orderStatusModel.find({order_id: order_id, deleted_at: null}).sort({_id: 1});

    if(orderTimeline.length > 0)
    {
        for(let i = 0; i < orderTimeline.length; i++)
        {
            let status = "Order Placed";

            if(orderTimeline[i].status == "confirmed")
            {
                status = "Order Confirmed";
            }
            else if(orderTimeline[i].status == "payment_failed")
            {
                status = "Payment Failed";
            }
            else if(orderTimeline[i].status == "delivered")
            {
                status = "Delivered";
            }
            else if(orderTimeline[i].status == "cancelled")
            {
                status = "Order Cancelled";
            }
            else if(orderTimeline[i].status == "return")
            {
                status = "Order Return";
            }
            else if(orderTimeline[i].status == "in_transit")
            {
                status = "In Transit";
            }

            let timelineobj = {
                status: status,
                flag: true,
                payment_status: orderTimeline[i].payment_status,
                message: orderTimeline[i].message != null && orderTimeline[i].message != "" ? orderTimeline[i].message : "",
                date: dateConvert((parseInt(orderTimeline[i].created_at) + (5*60+30)*60000))
            }
            
            // console.log(orderTimeline[i])
            timeline.push(timelineobj);
        }
        if(orderTimeline[orderTimeline.length - 1].status == 'confirmed') {
            var str = {
                status: "Delivered",
                flag: false,
                payment_status: "",
                message:  "",
                date: ""
            }
            timeline.push(str);
        }else if (orderTimeline[orderTimeline.length - 1].status == 'pending') {
            var str = {
                status: "Order Confirmed",
                flag: false,
                payment_status: "",
                message:  "",
                date: ""
            }
            timeline.push(str);
            var str1 = {
                status: "Delivered",
                flag: false,
                payment_status: "",
                message:  "",
                date: ""
            }
            timeline.push(str1);
        }
    }

    return timeline;
}

function dateConvert(timestamp) {
    var date = new Date(timestamp);

    return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

module.exports.insert_order_status = insert_order_status;
module.exports.orderDetailsStatus = orderDetailsStatus;
module.exports.getOrderDetailsStatusTimeLine = getOrderDetailsStatusTimeLine;
module.exports.getOrderStatusTimeLine = getOrderStatusTimeLine;