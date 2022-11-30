const orderModel = require('../model/order');
const orderStatusModel = require('../model/orderStatus');
const timelineModel = require('../model/timeline');
const ticketTimeLineModel = require('../model/ticketTimeLine');
const userModel = require('../model/user');
const inquiryModel = require('../model/inquiry');

const message = require('../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

var moment = require('moment'); 

exports.addTimeline = async(req,res,next) => {
    try {
        var str = await timelineModel.create({
            order_id : req.body.order_id,
            user_id : req.user.user_id,
            comment: req.body.comment
        });
        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY
        })
    }catch(err) {
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.getTimelineById = async(req, res, next) => {
    try {
        var gettimeline = await timelineModel.find({order_id: req.params.id})
        if (gettimeline.length > 0) {
            var str = []
            for (let x = 0; x < gettimeline.length; x++) {
                var userdetails = await userModel.findOne({_id:gettimeline[x].user_id})
                var check = moment(gettimeline[x].created_at).toObject();
                str.push(
                    {
                        comment: gettimeline[x].comment,
                        username: userdetails != null ? userdetails.first_name+" "+userdetails.last_name : "test user",
                        mobileno: userdetails != null ? userdetails.mobile_no : "8844556666",
                        day: check.date,
                        month : moment().month(check.months).format("MMM")
                    }
                )
            }
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY,
                data:str
            })
        }else {
            res.status(200).json({
                status:message.messages.FALSE,
                message:message.messages.TIMRLINE_NOT_EXISTS
            })
        }
    } catch (error) {
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.ticketGetTimeLineById = async(req, res, next) => {
    try {
        var gettimeline = await ticketTimeLineModel.find({ticket_id: req.params.id})
        if (gettimeline.length > 0) {
            var str = []
            for (let x = 0; x < gettimeline.length; x++) {
                var userdetails = await userModel.findOne({_id:gettimeline[x].user_id})
                var check = moment(gettimeline[x].created_at).toObject();
                console.log("check",check);
                let user_name = null;
                if(userdetails != null)
                {
                    let user_name = userdetails.first_name != null && userdetails.first_name != "null" && userdetails.first_name != undefined && userdetails.first_name != "undefined" && userdetails.first_name != "" ? userdetails.first_name : ""+" "+userdetails.last_name != null && userdetails.last_name != "null" && userdetails.last_name != undefined && userdetails.last_name != "undefined" && userdetails.last_name != "" ? userdetails.last_name : ""
                }

                str.push({comment: gettimeline[x].comment,username: user_name != null && user_name != "" ? user_name : "test user", mobileno: userdetails != null ? userdetails.mobile_no : "8844556666",time:check.hours + ":"+ check.minutes, day: check.date, month : moment().month(check.months).format("MMM")})
            }
            res.status(200).json({
                data:str,
                status:message.messages.TRUE,
                message:message.messages.DATA_GET_SUCCESSFULLY
            })
        }else {
            res.status(200).json({
                status:message.messages.FALSE,
                message:message.messages.TIMRLINE_NOT_EXISTS
            })
        }
    } catch (error) {
        console.log("error",error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.ticketAddTimeLines = async(req,res,next) => {
    try {
        var str = await ticketTimeLineModel.create({
            ticket_id : mongoose.Types.ObjectId(req.body.ticket_id),
            user_id : req.user.user_id,
            comment: req.body.comment,
            created_at:new Date().getTime()
        });

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY
        })
    }catch(err) {
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.ticketAddTimeLine = async(obj) => {
    try {
        var str = await ticketTimeLineModel.create({
            ticket_id : mongoose.Types.ObjectId(obj.ticket_id),
            user_id : obj.user_id,
            comment: obj.comment,
            created_at:new Date().getTime()
        });
       return
    }catch(err) {
        console.log(err);
       return
    }
}

exports.ticketStatusAdmin = async(req,res,next) => {
    try{
        let user_id = mongoose.Types.ObjectId(req.user.user_id);
        let ticketDetails = await inquiryModel.findOne({_id: req.body.id});
        if(ticketDetails)
        {

            let obj = {
                status: req.body.status,
                close_comment: req.body.comment
            }

            inquiryModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.body.id)}, obj, {upsert: true}, function(err, doc) {
                if (err)
                {
                    res.status(400).json({
                        status:message.messages.FALSE,
                        message:message.messages.SOMETHING_WENT_WRONG
                    })
                }
            });

            let objStatus = {
                user_id: ticketDetails.user_id,
                ticket_id: req.body.id,
                comment: req.body.status,
            };

            let addOrderStatus = await ticketTimeLineModel.create({
                ticket_id : mongoose.Types.ObjectId(objStatus.ticket_id),
                user_id : objStatus.user_id,
                comment : objStatus.comment,
                created_at:new Date().getTime()
            });

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.ORDER_STATUS
            })
        }
        else
        {
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.SOMETHING_WENT_WRONG
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