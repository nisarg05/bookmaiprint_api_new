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
const allocateOrderModel = require('../model/allocateOrder');

const message = require('../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../controller/categoryController');
const priceListController = require('../controller/priceListController');
const userOrderTimelineController = require('../controller/api/orderTimeLineController');
const userController = require('../controller/authController');
const user = require('../model/user');

const invoiceController = require('../controller/invoiceController');
const orderInfoController = require('./api/vendorOrderInfo');

exports.vendorOrderPendingStatus = async (req, res, next) => {
    try {
        const id = req.params.id;

        let allocateOrderList = await allocateOrderModel.find({ vendor_id: id, status: 0, deleted_at: null });
        //.distinct('order_id');

        let result = [];

        for (let i = 0; i < allocateOrderList.length; i++) {
            let orderInfo = await orderInfoController.order_details(allocateOrderList[i].order_id, allocateOrderList[i].order_details_id)

            result.push({
                _id: allocateOrderList[i]._id,
                status: allocateOrderList[i].status,
                price: allocateOrderList[i].price,
                order_detail_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_detail_id : {},
                category_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_id : {},
                category_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_details : {},
                price_list_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_id : {},
                price_list_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_details : {},
                question_list: orderInfo != null && orderInfo.products != null ? orderInfo.products.question_list : {},
                upload_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.upload_details : {},
                package_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.package_details : {},
                order_details_status: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_status : {},
                order_details_timeline: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_timeline : {},
                order_id: orderInfo != null ? orderInfo._id : null,
            });
        }

        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: result
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
}
exports.vendorGetOrderCounts = async (req, res, next) => {

    try {
        const id = req.params.id;
        let TotalOrder = await allocateOrderModel.find({ vendor_id: id, deleted_at: null });
        

        let TotalPendingOrder = await allocateOrderModel.count({ vendor_id: id,deleted_at: null, status: 0 });
        let TotalInProgressOrder = await allocateOrderModel.count({ vendor_id: id,deleted_at: null, status: 1 });
        let TotalCompletedOrder = await allocateOrderModel.count({ vendor_id: id,deleted_at: null, status: 2 });
        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timestamp = startOfDay / 1;

        var lasttimestamp = Date.now();
        let result = {};
        
        let TotalCompletedOrderToday = await allocateOrderModel.count({
            deleted_at: null, status: 2,vendor_id: id, created_at: {
                $gte: startOfDay,
                $lt: new Date()
            }
        });
        let TotalPendingOrderToday = await allocateOrderModel.count({
            deleted_at: null, status: 0,vendor_id: id, created_at: {
                $gte: startOfDay,
                $lt: new Date()
            }
        });
        let TotalInProgressOrderToday = await allocateOrderModel.count({
            deleted_at: null, status: 1,vendor_id: id, created_at: {
                $gte: startOfDay,
                $lt: new Date()
            }
        });
        //.distinct('order_id');


        result.TotalOrder = TotalOrder
        result.TotalPendingOrder = TotalPendingOrder
        result.TotalInProgressOrder = TotalInProgressOrder
        result.TotalCompletedOrder = TotalCompletedOrder
        result.timestamp = timestamp
        result.lasttimestamp = lasttimestamp
        result.TotalCompletedOrderToday = TotalCompletedOrderToday
        result.TotalPendingOrderToday = TotalPendingOrderToday
        result.TotalInProgressOrderToday = TotalInProgressOrderToday
        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: result
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
    try {
        const id = req.params.id;

        let allocateOrderList = await allocateOrderModel.find({ vendor_id: id, status: 0, deleted_at: null });
        //.distinct('order_id');

        let result = [];

        for (let i = 0; i < allocateOrderList.length; i++) {
            let orderInfo = await orderInfoController.order_details(allocateOrderList[i].order_id, allocateOrderList[i].order_details_id)

            result.push({
                _id: allocateOrderList[i]._id,
                status: allocateOrderList[i].status,
                price: allocateOrderList[i].price,
                order_detail_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_detail_id : {},
                category_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_id : {},
                category_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_details : {},
                price_list_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_id : {},
                price_list_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_details : {},
                question_list: orderInfo != null && orderInfo.products != null ? orderInfo.products.question_list : {},
                upload_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.upload_details : {},
                package_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.package_details : {},
                order_details_status: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_status : {},
                order_details_timeline: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_timeline : {},
                order_id: orderInfo != null ? orderInfo._id : null,
            });
        }

        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: result
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.adminTotalOrder = async (req, res, next) => {
    try {
        let allocateOrderList = await orderModel.count({ deleted_at: null });
        //.distinct('order_id');

        let result = [];

        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: allocateOrderList
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
}
exports.adminGetOrderCounts = async (req, res, next) => {
    try {

        let TotalOrder = await orderModel.count({ deleted_at: null });

        let TotalPendingOrder = await orderModel.count({ deleted_at: null, status: 'pending' });
        let TotalInProgressOrder = await orderModel.count({ deleted_at: null, status: 'confirmed' });
        let TotalCompletedOrder = await orderModel.count({ deleted_at: null, status: 'delivered' });
        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timestamp = startOfDay / 1;

        var lasttimestamp = Date.now();
        let result = {};
        
        let TotalCompletedOrderToday = await orderModel.count({
            deleted_at: null, status: 'delivered', created_at: {
                $gte: startOfDay,
                $lt: new Date()
            }
        });
        let TotalPendingOrderToday = await orderModel.count({
            deleted_at: null, status: 'pending', created_at: {
                $gte: startOfDay,
                $lt: new Date()
            }
        });
        let TotalInProgressOrderToday = await orderModel.count({
            deleted_at: null, status: 'confirmed', created_at: {
                $gte: startOfDay,
                $lt: new Date()
            }
        });
        //.distinct('order_id');


        result.TotalOrder = TotalOrder
        result.TotalPendingOrder = TotalPendingOrder
        result.TotalInProgressOrder = TotalInProgressOrder
        result.TotalCompletedOrder = TotalCompletedOrder
        result.timestamp = timestamp
        result.lasttimestamp = lasttimestamp
        result.TotalCompletedOrderToday = TotalCompletedOrderToday
        result.TotalPendingOrderToday = TotalPendingOrderToday
        result.TotalInProgressOrderToday = TotalInProgressOrderToday
        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: result
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.adminOrderPendingStatus = async (req, res, next) => {
    try {
        let allocateOrderList = await allocateOrderModel.find({ status: 0, deleted_at: null });

        let result = [];

        for (let i = 0; i < allocateOrderList.length; i++) {
            let orderInfo = await orderInfoController.order_details(allocateOrderList[i].order_id, allocateOrderList[i].order_details_id)

            result.push({
                _id: allocateOrderList[i]._id,
                status: allocateOrderList[i].status,
                price: allocateOrderList[i].price,
                order_detail_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_detail_id : {},
                category_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_id : {},
                category_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.category_details : {},
                price_list_id: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_id : {},
                price_list_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.price_list_details : {},
                question_list: orderInfo != null && orderInfo.products != null ? orderInfo.products.question_list : {},
                upload_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.upload_details : {},
                package_details: orderInfo != null && orderInfo.products != null ? orderInfo.products.package_details : {},
                order_details_status: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_status : {},
                order_details_timeline: orderInfo != null && orderInfo.products != null ? orderInfo.products.order_details_timeline : {},
                user_details: orderInfo != null && orderInfo.user_details != null ? orderInfo.user_details : {},
                user_address_details: orderInfo != null && orderInfo.user_address_details != null ? orderInfo.user_address_details : {},
                order_id: orderInfo != null ? orderInfo._id : null,
            });
        }

        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: result
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.adminOrderApprovedStatus = async (req, res, next) => {
    try {
        let allocateOrderList = await allocateOrderModel.count({ status: 1, deleted_at: null });

        res.status(200).json({
            status: message.messages.TRUE,
            message: message.messages.DATA_GET_SUCCESSFULLY,
            data: allocateOrderList
        })
    } catch (err) {
        console.log("err", err)
        res.status(400).json({
            status: message.messages.FALSE,
            message: message.messages.SOMETHING_WENT_WRONG
        })
    }
}