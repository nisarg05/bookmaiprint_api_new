const couponCodeModel = require('../../model/couponCode');
const categoryModel = require('../../model/category');
const questionModel = require('../../model/question');
const answerModel = require('../../model/answer');
const priceListModel = require('../../model/priceList');
const orderModel = require('../../model/order');
const addressModel = require('../../model/address');
const otpModel = require('../../model/otp');
const orderDetailsModel = require('../../model/orderDetails');
const orderStatusModel = require('../../model/orderStatus');
const uploadModel = require('../../model/upload');
const packageModel = require('../../model/package');
const deliveryChargeModel = require('../../model/deliveryCharge');
const allocateOrderModel = require('../../model/allocateOrder');
const vendorModel = require('../../model/vendorRegister');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../categoryController');
const priceListController = require('../priceListController');
const userOrderTimelineController = require('../api/orderTimeLineController');
const userController = require('../authController');
const user = require('../../model/user');
const logger = require('../../utils/logger').logger;
const invoiceController = require('../invoiceController');

async function order_details(order_id, order_detail_id) {
    let order_info = await orderModel.findOne({_id: order_id});
    let order_details_info = await orderDetailsModel.find({order_id: order_id, _id: order_detail_id});

    if(order_info)
    {
        let coupon_code_info = null, products = [];

        let total_amount = 0, total_package_amount = 0;
        for(let i = 0; i < order_details_info.length; i++)
        {
            let order_details_status = null, order_details_timeline = [];
            let category_info = await categoryModel.findOne({_id: order_details_info[i].category_id});
            let price_list_info = await priceListModel.findOne({_id: order_details_info[i].price_list_id});
            let uploadInfo = null, packageInfo = null;
            if(order_details_info[i].upload_file_id != "" && order_details_info[i].upload_file_id != "undefined" && order_details_info[i].upload_file_id != "null" && order_details_info[i].upload_file_id != undefined && order_details_info[i].upload_file_id != null)
            {
                uploadInfo = await uploadModel.findOne({_id: order_details_info[i].upload_file_id});
            }
            if(order_details_info[i].package_id != "" && order_details_info[i].package_id != "undefined" && order_details_info[i].package_id != "null" && order_details_info[i].package_id != undefined && order_details_info[i].package_id != null)
            {
                packageInfo = await packageModel.findOne({_id: order_details_info[i].package_id}).lean();
                if(packageInfo)
                {
                    total_package_amount = total_package_amount + packageInfo.charge;
                }
            }

            total_amount = total_amount + price_list_info.price

            if(order_info.is_deliver_same_address != 1)
            {
                order_details_status = await userOrderTimelineController.orderDetailsStatus(order_details_info[i]._id);

                order_details_timeline = await userOrderTimelineController.getOrderDetailsStatusTimeLine(order_details_info[i]._id);
            }

            products.push({
                order_detail_id: order_details_info[i]._id,
                category_id : order_details_info[i].category_id,
                category_details : await categoryController.get_category_info(category_info),
                price_list_id : order_details_info[i].price_list_id,
                price_list_details : await priceListController.get_order_price_info(price_list_info, order_info.created_at),
                question_list : JSON.parse(order_details_info[i].question_list),
                upload_details: uploadInfo,
                package_details: packageInfo,
                order_details_status: order_details_status,
                order_details_timeline: order_details_timeline,
            })
        }

        let user_info = await user.findOne({_id: order_info.user_id});
        let user_address_info = await addressModel.findOne({_id: order_info.user_address_id});
        
        if(order_info.coupon_code_id != null && order_info.coupon_code_id != "null" && order_info.coupon_code_id != "" && order_info.coupon_code_id != undefined && order_info.coupon_code_id != "undefined"){coupon_code_info = await couponCodeModel.findOne({_id: order_info.coupon_code_id}).lean()};

        let obj = {
            _id : order_info._id,
            products : products.length > 0 ? products[0] : {},
            user_id : order_info.user_id,
            user_details : user_info,
            invoice_no : order_info.invoice_no,
            total : order_info.total,
            discount : order_info.discount,
            coupon_code_id : order_info.coupon_code_id,
            coupon_code_details : coupon_code_info,
            gst : order_info.gst,
            comment : order_info.comment,
            user_address_id : order_info.user_address_id,
            user_address_details : user_address_info,
            status : order_info.status,
            payment_status : order_info.payment_status,
            timeline: await userOrderTimelineController.getOrderStatusTimeLine(order_info._id),
            invoice_url : order_info.invoice_url,
            is_placed : order_info.is_placed,
            created_at : userController.changeDateFormat(order_info.created_at),
            created_at_timestamp : order_info.created_at,
            total_amount : total_amount,
            total_package_amount : total_package_amount,
            tax : order_info.tax,
            tax_amount : order_info.tax_amount,
            is_deliver_same_address: order_info.is_deliver_same_address == 1 || order_info.is_deliver_same_address == "1" ? 1 : 0,
            delivery_price: order_info.delivery_price,
            is_delivered : order_info.status == "delivered" || order_info.status == "cancelled" || order_info.status == "return" ? 1 : 0
        }

        return obj;
    }
    else
    {
        return null;
    }
}

module.exports.order_details = order_details;