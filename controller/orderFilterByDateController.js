const fs = require('fs');
let path = require('path');
const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const message = require('../config/message');
var moment = require('moment');
const mongoose = require("mongoose");
var pdf = require("pdf-creator-node");
var html = fs.readFileSync(path.resolve(__dirname, "../html/template.html"), "utf8");
const orderModal = require('../model/order');
const orderDetails = require('../model/orderDetails');
const orderController = require('../controller/api/orderController')
const address = require('../model/address');
const CouponCode = require('../model/couponCode');
const users = require('../model/user');
const invoice = require('../model/invoice')
const userController = require('../controller/authController')
const multer = require('multer');
const sharp = require('sharp');

exports.generateDateWiseReport = async(req,res,next) => {
	try {
        var d = new Date()
        let start_date = new Date(req.body.start).getTime();
        let end_date = new Date(req.body.end).getTime();

        var getorder = await orderModal.aggregate([
            {$match: {"created_at":{ $gte : start_date, $lte : end_date}}},
            { "$addFields": {
               "created_at": {
                   "$toDate": "$created_at"
               }
            }},
           {$group : {_id : { $dateToString: { format: "%Y-%m-%d", date: "$created_at"}},AvgAmount:{$avg:"$total"},min:{$min:"$total"},max:{$max: "$total"},totalAmount:{$sum:"$total"},count: { $sum: 1 }}}
        ])

        function datesArray(start, end) {
            let result = [], current = new Date(start);
            while (current < end)
                result.push(current) && (current = new Date(current)) && current.setDate(current.getDate() + 1);
            return result;
        }
        
        const test = datesArray(
            start_date, 
            end_date
        );
        
        var newArray = []
        for (let i = 0; i < test.length; i ++ ) {
            var str = false
            for (let k = 0; k < getorder.length; k++) {
                if (test[i].toISOString().slice(0,10) == getorder[k]._id) {
                    str = true
                    newArray.push({_id:test[i].toISOString().slice(0,10),AvgAmount:getorder[k].AvgAmount,min:getorder[k].min,max:getorder[k].max,count:getorder[k].count,totalAmount:getorder[k].totalAmount})
                }
            }
            if(!str) {
                newArray.push({_id:test[i].toISOString().slice(0,10),count:0,AvgAmount:0,min:0,max:0,totalAmount:0})
            }
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: newArray
        })
    } catch (error) {
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG,
        })
    }
}

exports.generateCouponCodeWiseReport = async(req, res, next) => {
    try {
        var d = new Date()
        let start_date = new Date(req.body.start).getTime();
        let end_date = new Date(req.body.end).getTime();
        var couponarr = []
        for (let k = 0; k < req.body.couponarray.length; k++) {
            couponarr.push(mongoose.Types.ObjectId(req.body.couponarray[k]))
        }
        var getorder = await orderModal.aggregate([
            {$match: {"created_at":{ $gte : start_date, $lte : end_date},"coupon_code_id":{$in:couponarr}}},
            { "$addFields": {
               "created_at": {
                   "$toDate": "$created_at"
                }
            }},
           {$group : {_id : { $dateToString: { format: "%Y-%m-%d", date: "$created_at"}},AvgAmount:{$avg:"$total"},min:{$min:"$total"},max:{$max: "$total"},totalAmount:{$sum:"$total"},count: { $sum: 1 }}}
        ])

        function datesArray(start, end) {
            let result = [], current = new Date(start);
            while (current < end)
                result.push(current) && (current = new Date(current)) && current.setDate(current.getDate() + 1);
            return result;
         }
        
        const test = datesArray(
            start_date, 
            end_date
        );
        
        var newArray = []
        for (let i = 0; i < test.length; i ++ ) {
            var str = false
            for (let k = 0; k < getorder.length; k++) {
                if (test[i].toISOString().slice(0,10) == getorder[k]._id) {
                    str = true
                    newArray.push({_id:test[i].toISOString().slice(0,10),AvgAmount:getorder[k].AvgAmount,min:getorder[k].min,max:getorder[k].max,count:getorder[k].count,totalAmount:getorder[k].totalAmount})
                }
            }
            if(!str) {
                newArray.push({_id:test[i].toISOString().slice(0,10),count:0,AvgAmount:0,min:0,max:0,totalAmount:0})
            }
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: newArray
        })
    } catch (error) {
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG,
        })
    }
}

exports.generateSubCategoryWiseReport = async(req, res, next) => {
    try {
        var d = new Date()
        let start_date = new Date(req.body.start).getTime();
        let end_date = new Date(req.body.end).getTime();
        var category_id = mongoose.Types.ObjectId(req.body.sub_category_id);

        var getorder = await orderModal.aggregate([
            {$match: {"created_at":{ $gte : start_date, $lte : end_date}}},
            {$lookup:
                {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order_id",
                    as: "orderdetails"
                }
            },
            {
                $unwind : "$orderdetails"
            },
            {
                $match: {"orderdetails.category_id": category_id}
            },
            {$lookup:
                {
                    from: "pricelists",
                    localField: "orderdetails.price_list_id",
                    foreignField: "_id",
                    as: "pricelists"
                }
            },
            {
                $unwind : "$pricelists"
            },
            { "$addFields": {
               "created_at": {
                   "$toDate": "$created_at"
               }
           } },
           {$group : {_id : { $dateToString: { format: "%Y-%m-%d", date: "$created_at"}},AvgAmount:{$avg:"$pricelists.price"},min:{$min:"$pricelists.price"},max:{$max: "$pricelists.price"},totalAmount:{$sum:"$pricelists.price"},count: { $sum: 1 }}}
        ])

        function datesArray(start, end) {
            let result = [], current = new Date(start);
            while (current < end)
                result.push(current) && (current = new Date(current)) && current.setDate(current.getDate() + 1);
            return result;
         }
        
        const test = datesArray(
            start_date, 
            end_date
        );
        
        var newArray = []
        for (let i = 0; i < test.length; i ++ ) {
            var str = false
            for (let k = 0; k < getorder.length; k++) {
                if (test[i].toISOString().slice(0,10) == getorder[k]._id) {
                    str = true
                    newArray.push({_id:test[i].toISOString().slice(0,10),AvgAmount:getorder[k].AvgAmount,min:getorder[k].min,max:getorder[k].max,count:getorder[k].count,totalAmount:getorder[k].totalAmount})
                }
            }
            if(!str) {
                newArray.push({_id:test[i].toISOString().slice(0,10),count:0,AvgAmount:0,min:0,max:0,totalAmount:0})
            }
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: newArray
        })
    } catch (error) {
        console.log("error",error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG,
        })
    }
}