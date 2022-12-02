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

const mailFunction = require('../../config/mail');
exports.placeOrder = async(req,res,next) => {
    try{
        let result = [];
        let user_id = req.user == null || req.user == "" || req.user == "null" ? null : mongoose.Types.ObjectId(req.user.user_id), is_already_login = true, is_otp_required_error = false, is_otp_not_match = false, coupon_code_error = false, checkCouponCode = null, upload_file_id = null, selected_package_id = null;

        if(user_id == null)
        {
            is_already_login = false;
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

        if(is_already_login == false && is_already_login != true)
        {
            let otpString = req.body.otp == null || req.body.otp == undefined || req.body.otp == "" || req.body.otp == "null" || req.body.otp == "undefined" ? null : req.body.otp
            if(otpString == null)
            {
                is_otp_required_error = true;
            }
            else
            {
                let otpExists = await otpModel.findOne({otp: req.body.otp, mobile_no: req.body.mobile_no, status: '0'})
                if(otpExists)
                {
                    let verifyOtp = await otpModel.findOneAndUpdate(
                        {mobile_no: req.body.mobile_no, status: '0', otp: req.body.otp},
                        {$set: {status: '1'}},
                        {new : true}
                    );

                    const newAddress = new addressModel(
                        {
                            name: req.body.name,
                            house_no: req.body.house_no,
                            address_line_1: req.body.address_line_1,
                            address_line_2: req.body.address_line_2 != undefined && req.body.address_line_2 != null && req.body.address_line_2 != "undefined" && req.body.address_line_2 != "null" && req.body.address_line_2 != "" ? req.body.address_line_2 : null,
                            landmark: req.body.landmark != undefined && req.body.landmark != null && req.body.landmark != "undefined" && req.body.landmark != "null" && req.body.landmark != "" ? req.body.landmark : null,
                            city: req.body.city != undefined && req.body.city != null && req.body.city != "undefined" && req.body.city != "null" && req.body.city != "" ? req.body.city : null,
                            state: req.body.state != undefined && req.body.state != null && req.body.state != "undefined" && req.body.state != "null" && req.body.state != "" ? req.body.state : null,
                            country: req.body.country != undefined && req.body.country != null && req.body.country != "undefined" && req.body.country != "null" && req.body.country != "" ? req.body.country : null,
                            state_code: req.body.state_code != undefined && req.body.state_code != null && req.body.state_code != "undefined" && req.body.state_code != "null" && req.body.state_code != "" ? req.body.state_code : null,
                            country_code: req.body.country_code != undefined && req.body.country_code != null && req.body.country_code != "undefined" && req.body.country_code != "null" && req.body.country_code != "" ? req.body.country_code : null,
                            pincode: req.body.pincode != undefined && req.body.pincode != null && req.body.pincode != "undefined" && req.body.pincode != "null" && req.body.pincode != "" ? req.body.pincode : null,
                            is_default: req.body.is_default != undefined && req.body.is_default != null && req.body.is_default == 1 || req.body.is_default == '1' ? 1 : 0,
                            is_office: req.body.is_office != undefined && req.body.is_office != null && req.body.is_office == 1 || req.body.is_office == '1' ? 1 : 0,
                            mobile_no: req.body.mobile_no != undefined && req.body.mobile_no != null && req.body.mobile_no != "undefined" && req.body.mobile_no != "null" && req.body.mobile_no != "" ? req.body.mobile_no : null,
                            user_id: user_id != null ? mongoose.Types.ObjectId(user_id) : null,
                            created_at: new Date().getTime(),
                            created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                        }
                    )
            
                    await newAddress.save();

                    req.body.user_address_id = newAddress._id
                }
                else
                {
                    is_otp_not_match = true;
                }
            }
        }

        if(req.body.user_address_id != null && req.body.user_address_id != "null" && req.body.user_address_id != undefined && req.body.user_address_id != "undefined" && req.body.user_address_id != "")
        {
            req.body.user_address_id = req.body.user_address_id;
        }
        else
        {
            const newAddress = new addressModel(
                {
                    name: req.body.name,
                    house_no: req.body.house_no,
                    address_line_1: req.body.address_line_1,
                    address_line_2: req.body.address_line_2 != undefined && req.body.address_line_2 != null && req.body.address_line_2 != "undefined" && req.body.address_line_2 != "null" && req.body.address_line_2 != "" ? req.body.address_line_2 : null,
                    landmark: req.body.landmark != undefined && req.body.landmark != null && req.body.landmark != "undefined" && req.body.landmark != "null" && req.body.landmark != "" ? req.body.landmark : null,
                    city: req.body.city != undefined && req.body.city != null && req.body.city != "undefined" && req.body.city != "null" && req.body.city != "" ? req.body.city : null,
                    state: req.body.state != undefined && req.body.state != null && req.body.state != "undefined" && req.body.state != "null" && req.body.state != "" ? req.body.state : null,
                    country: req.body.country != undefined && req.body.country != null && req.body.country != "undefined" && req.body.country != "null" && req.body.country != "" ? req.body.country : null,
                    state_code: req.body.state_code != undefined && req.body.state_code != null && req.body.state_code != "undefined" && req.body.state_code != "null" && req.body.state_code != "" ? req.body.state_code : null,
                    country_code: req.body.country_code != undefined && req.body.country_code != null && req.body.country_code != "undefined" && req.body.country_code != "null" && req.body.country_code != "" ? req.body.country_code : null,
                    pincode: req.body.pincode != undefined && req.body.pincode != null && req.body.pincode != "undefined" && req.body.pincode != "null" && req.body.pincode != "" ? req.body.pincode : null,
                    is_default: req.body.is_default != undefined && req.body.is_default != null && req.body.is_default == 1 || req.body.is_default == '1' ? 1 : 0,
                    is_office: req.body.is_office != undefined && req.body.is_office != null && req.body.is_office == 1 || req.body.is_office == '1' ? 1 : 0,
                    mobile_no: req.body.mobile_no != undefined && req.body.mobile_no != null && req.body.mobile_no != "undefined" && req.body.mobile_no != "null" && req.body.mobile_no != "" ? req.body.mobile_no : null,
                    user_id: user_id != null ? mongoose.Types.ObjectId(user_id) : null,
                    created_at: new Date().getTime(),
                    created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }
            )
    
            await newAddress.save();

            req.body.user_address_id = newAddress._id
        }

        if(req.body.coupon_id != null && req.body.coupon_id != "null" && req.body.coupon_id != "" && req.body.coupon_id != undefined && req.body.coupon_id != "undefined")
        {
            checkCouponCode = await couponCodeModel.findOne({_id:req.body.coupon_id});
            if(checkCouponCode == null || checkCouponCode == "" || checkCouponCode == "null")
            {
                coupon_code_error == true;
            }
        }

        if(req.body.upload_file_id != null && req.body.upload_file_id != "null" && req.body.upload_file_id != "" && req.body.upload_file_id != undefined && req.body.upload_file_id != "undefined")
        {
            upload_file_id = req.body.upload_file_id
        }

        if(req.body.selected_package_id != null && req.body.selected_package_id != "null" && req.body.selected_package_id != "" && req.body.selected_package_id != undefined && req.body.selected_package_id != "undefined")
        {
            selected_package_id = req.body.selected_package_id;
        }

        if(is_otp_required_error == true){
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.OTP_IS_REQUIRED
            })
        }
        else if(is_otp_not_match == true){
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.OTP_NOT_EXISTS
            })
        }
        else if(coupon_code_error == true){
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.COUPON_CODE_NOT_EXISTS
            })
        }
        else
        {
            var total_amount = 0;
            for(i = 0; i < req.body.category_id.length; i++)
            {
                let priceListInfo = await priceListModel.findOne({_id: req.body.price_list_id[i], is_enable: 1})
                if(priceListInfo)
                {
                    total_amount = total_amount + priceListInfo.price;
                }

                if(selected_package_id != null && selected_package_id != "null" && selected_package_id != undefined && selected_package_id != "undefined" && selected_package_id != "" && selected_package_id[i] != null && selected_package_id[i] != "null" && selected_package_id[i] != undefined && selected_package_id[i] != "undefined" && selected_package_id[i] != "")
                {
                    let packagePriceListInfo = await packageModel.findOne({_id: selected_package_id[i], is_enable: 1})
                    if(packagePriceListInfo)
                    {
                        total_amount = total_amount + packagePriceListInfo.charge;
                    }
                }
            }

            let orderStatus = "pending", paymentStatus = "payment_pending", coupon_code_discount = 0;

            if(checkCouponCode != "null" && checkCouponCode != null && checkCouponCode != ""){
                if(checkCouponCode.coupontype_name == "Percentage")
                {
                    var discounted_amount = (total_amount*checkCouponCode.percantage_value/100)
                    if(!checkCouponCode.percantage_max_value>discounted_amount){
                        var discounted_amount = checkCouponCode.percantage_max_value
                    }

                    coupon_code_discount = parseInt(discounted_amount);   
                    total_amount = total_amount - discounted_amount
                }
                else
                {
                    var discounted_amount = checkCouponCode.flat_value
                    coupon_code_discount = parseInt(discounted_amount);
                    total_amount = total_amount - discounted_amount
                }
            }

            let deliveryCharge = 0, isSameDelivery = 0;

            if(req.body.delivery_charge_id != undefined && req.body.delivery_charge_id != "undefined" && req.body.delivery_charge_id != null && req.body.delivery_charge_id != "null" && req.body.delivery_charge_id != "")
            {
                let deliveryChargeInfo = await deliveryChargeModel.findOne({_id: req.body.delivery_charge_id})
                if(deliveryChargeInfo)
                {
                    deliveryCharge = parseInt(deliveryChargeInfo.price);

                    if(req.body.is_deliver_same_address != undefined && req.body.is_deliver_same_address != "undefined" && req.body.is_deliver_same_address != null && req.body.is_deliver_same_address != "null" && req.body.is_deliver_same_address != "" && req.body.is_deliver_same_address == "1" || req.body.is_deliver_same_address == 1)
                    {
                        deliveryCharge = parseInt(deliveryChargeInfo.price);
                        isSameDelivery = 1;
                    }
                    else
                    {
                        deliveryCharge = (parseInt(deliveryChargeInfo.price) * req.body.category_id.length);
                        isSameDelivery = 0;
                    }
                }
            }

            total_amount = total_amount + deliveryCharge;

            if(Math.sign(total_amount) <= 0)
            {
                total_amount = 0;
                let orderStatus = "confirmed", paymentStatus = "payment_success";
            }

            let invoice_no_details = await invoice_no();

            let taxPer = parseInt(req.body.tax)
            const newOrder = new orderModel(
                {
                    user_id: mongoose.Types.ObjectId(user_id),
                    invoice_no: invoice_no_details,
                    total: (total_amount+(total_amount*taxPer/100)),
                    discount: coupon_code_discount,
                    coupon_code_id: req.body.coupon_id != null && req.body.coupon_id != "" ? mongoose.Types.ObjectId(req.body.coupon_id) : null,
                    gst: req.body.is_gst_number,
                    status: orderStatus,
                    payment_status: paymentStatus,
                    user_address_id: req.body.user_address_id != null && req.body.user_address_id != "" ? mongoose.Types.ObjectId(req.body.user_address_id) : null,
                    payment_mode_id: null,
                    delivery_type_id: req.body.delivery_charge_id != undefined && req.body.delivery_charge_id != "undefined" && req.body.delivery_charge_id != null && req.body.delivery_charge_id != "null" && req.body.delivery_charge_id != "" ? mongoose.Types.ObjectId(req.body.delivery_charge_id) : null,
                    delivery_price: deliveryCharge,
                    tax:req.body.tax != undefined && req.body.tax != "undefined" && req.body.tax != null && req.body.tax != "null" && req.body.tax != "" && parseInt(req.body.tax) > 0 ? parseInt(req.body.tax) : 0,
                    tax_amount: (total_amount*taxPer/100),
                    is_deliver_same_address: req.body.is_deliver_same_address != undefined && req.body.is_deliver_same_address != "undefined" && req.body.is_deliver_same_address != null && req.body.is_deliver_same_address != "null" && req.body.is_deliver_same_address != "" && req.body.is_deliver_same_address > 0 ? 1 : 0,
                    created_at: new Date().getTime(),
                    created_by: mongoose.Types.ObjectId(user_id)
                }
            );

            await newOrder.save();
            var userExists = await user.findOne({_id: mongoose.Types.ObjectId(user_id), deleted_at: null});
          //  await mailFunction.send_mail(userExists.email, "Order Update", "Your Order "+newOrder.invoice_no+" status has update new Status : "+orderStatus);
            await mailFunction.send_mail(userExists.email, "Order Update", "Your Order "+newOrder.invoice_no+" status has update new Status : "+orderStatus);
           
            for(i = 0; i < req.body.category_id.length; i++)
            {
                let orderPriceInfo = await priceListModel.findOne({_id: mongoose.Types.ObjectId(req.body.price_list_id[i])});

                let orderPackageTime = 0;

                if(selected_package_id != null && selected_package_id != "null" && selected_package_id != "" && selected_package_id != undefined && selected_package_id != "undefined" && selected_package_id.length > 0 && selected_package_id[i] != undefined && selected_package_id[i] != null && selected_package_id[i] != "undefined" && selected_package_id[i] != "null" && selected_package_id[i] != "")
                {
                    let orderPackagePriceInfo = await packageModel.findOne({_id: mongoose.Types.ObjectId(selected_package_id[i])})

                    if(orderPackagePriceInfo)
                    {
                        orderPackageTime = orderPackagePriceInfo.time
                    }
                }

                const newOrderDetails = new orderDetailsModel(
                    {
                        user_id: mongoose.Types.ObjectId(user_id),
                        order_id: mongoose.Types.ObjectId(newOrder._id),
                        category_id: mongoose.Types.ObjectId(req.body.category_id[i]),
                        price_list_id: mongoose.Types.ObjectId(req.body.price_list_id[i]),
                        price_list_time: isSameDelivery == 1 || isSameDelivery == "1" ? Math.max(...req.body.price_duration) : req.body.price_duration[i],
                        question_list: JSON.stringify(req.body.question_list[i]),
                        upload_file_id: upload_file_id != null && upload_file_id != "null" && upload_file_id != "" && upload_file_id != undefined && upload_file_id != "undefined" && upload_file_id.length > 0 && upload_file_id[i] != undefined && upload_file_id[i] != null && upload_file_id[i] != "undefined" && upload_file_id[i] != "null" && upload_file_id[i] != "" ? mongoose.Types.ObjectId(upload_file_id[i]) : null,
                        package_id: selected_package_id != null && selected_package_id != "null" && selected_package_id != "" && selected_package_id != undefined && selected_package_id != "undefined" && selected_package_id.length > 0 && selected_package_id[i] != undefined && selected_package_id[i] != null && selected_package_id[i] != "undefined" && selected_package_id[i] != "null" && selected_package_id[i] != "" ? mongoose.Types.ObjectId(selected_package_id[i]) : null,
                        package_time: orderPackageTime,
                        created_at: new Date().getTime(),
                        created_by: mongoose.Types.ObjectId(user_id)
                    }
                );
        
                await newOrderDetails.save();
            }

            let invoice_generate = await invoiceController.download_invoice(newOrder._id)

            await orderModel.updateOne({_id: newOrder._id},{$set :{
               invoice_url: invoice_generate
            }});

            let obj = {
                user_id: user_id,
                order_id: newOrder._id,
                status: orderStatus,
                payment_status: paymentStatus,
                message: "",
                is_deliver_same_address: req.body.is_deliver_same_address != undefined && req.body.is_deliver_same_address != "undefined" && req.body.is_deliver_same_address != null && req.body.is_deliver_same_address != "null" && req.body.is_deliver_same_address != "" && req.body.is_deliver_same_address > 0 ? 1 : 0,
            };

            let addOrderStatus = await userOrderTimelineController.insert_order_status(obj);

            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_ADD_SUCCESSFULLY,
                data: await order_details(newOrder._id)
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

exports.transactionOrder = async(req, res, next) => {
    try {
        var update = await orderModel.updateOne({_id:req.body.id},{$set:{transaction_id:req.body.transaction_id}})
        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_UPDATE_SUCCESSFULLY,  
        })
    } catch (error) {
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
}

exports.getAllUserOrderList = async(req,res,next) => {
    try{
        const page = req.params.page;
        const limit = 10;

        let condition = {
            deleted_at: null
        }

        let req_user_id = null;
        if(req.body.user_id != null && req.body.user_id != "null" && req.body.user_id != undefined && req.body.user_id != "undefined" && req.body.user_id != "")
        {
            req_user_id = req.body.user_id;
            condition.user_id = req.body.user_id;
        }

        var count = await count_orders(condition);

        let orders = await orderModel.find(condition).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = []
   
        for(let i = 0; i < orders.length; i++)
        {
            result.push(await order_details(orders[i]._id))
        }

        let update_recent_order = await orderModel.updateMany(condition,{$set :{
            is_recent: 0
        }});
        console.log(  result); 
        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                orders : result,
                totalPages : Math.ceil(count / limit),
                currentPage : page
            }
        })
    }
    catch(error){
        console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error || error.message
        })
    }
}

exports.getRecentOrderCount = async(req,res,next) => {
    try{
        let condition = {
            deleted_at: null,
            is_recent: 1
        }

        let ordersCounter = await orderModel.count(condition)

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            counter:ordersCounter
        })
    }
    catch(error){
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}

exports.getUserOrderList = async(req,res,next) => {
    try{
        const page = req.params.page;
        let user_id = mongoose.Types.ObjectId(req.user.user_id);
        const limit = 5;
        var count = await count_user_orders(user_id);

        let orders = await orderModel.find({deleted_at: null, user_id: user_id}).limit(limit * 1).skip((page - 1) * limit).sort({_id: -1}), result = []

        for(let i = 0; i < orders.length; i++)
        {
            result.push(await order_details(orders[i]._id))
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: {
                orders : result,
                totalPages : Math.ceil(count / limit),
                currentPage : page
            }
        })
    }
    catch(error){
        console.log(err);
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}

exports.orderDetails = async(req,res,next) => {
    try{
        let result = [], timeline = [];
        let user_id = mongoose.Types.ObjectId(req.user.user_id);
        let order_id = req.post.id;
        
        var orderDetails = await orderModel.findOne({_id: order_id});
        if(orderDetails)
        {
            let data = await order_details(order_id);
            for (const detailsOrder of data) {
                result.push(detailsOrder);
            }

            if(result.length > 0)
            {
                let orderTimeline = await orderStatusModel.find({order_id: order_id, user_id: user_id}).sort({_id: -1});

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
                            payment_status: orderTimeline[i].payment_status,
                            message: orderTimeline[i].message != null && orderTimeline[i].message != "" ? orderTimeline[i].message : "",
                            date: dateConvert(orderTimeline[i].created_at)
                        }

                        timeline.push(timelineobj);
                    }
                }
                
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_GET_SUCCESSFULLY,
                    data:""
                })
            }
            else
            {
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_GET_SUCCESSFULLY,
                    data: null
                })
            }
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.SOMETHING_WENT_WRONG
            })
        }
    }catch(err){
        res.status(400).json({
            status:message.messages.FALSE,
            message:err
        })
    }
}

exports.orderGetById = async(req, res, next) => {
    try {
        var getorders = await orderModel.findOne({_id:req.params.id}), obj = null;
        
        if(getorders)
        {
            obj = await order_details(getorders._id)
        }

        res.status(200).json({
            data: obj,
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY
        })
    } catch (error) {
        // console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.getAllUserOrderListWithoutPagination = async(req,res,next) => {
    try{
        let orders = await orderModel.find({deleted_at: null}).sort({_id: -1}), result = []

        for(let i = 0; i < orders.length; i++)
        {
            result.push(await order_details(orders[i]._id))
        }

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_GET_SUCCESSFULLY,
            data: result
        })
    }
    catch(error){
        // console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error
        })
    }
}

async function count_orders(condition) {
    const detailsOrder = await orderModel.count(condition);

    return detailsOrder;
}

async function count_user_orders(user_id) {
    const detailsOrder = await orderModel.count({deleted_at: null, user_id: user_id});

    return detailsOrder;
}

async function order_details(order_id) {
    let order_info = await orderModel.findOne({_id: order_id});
    let order_details_info = await orderDetailsModel.find({order_id: order_id});

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
            
            let allocate_details = null;
            let allocate_order_info = await allocateOrderModel.findOne({order_id: order_id, order_details_id: order_details_info[i]._id, deleted_at: null}).sort({ _id: -1 });

            if(allocate_order_info)
            {
                let vendor_info = await vendorModel.findOne({_id: allocate_order_info.vendor_id});
                allocate_details = {
                    _id : allocate_order_info._id,
                    price : allocate_order_info.price,
                    status : allocate_order_info.status,
                    delivery_time:allocate_order_info.delivery_time,
                    first_name : vendor_info != null ? vendor_info.first_name : "",
                    last_name : vendor_info != null ? vendor_info.last_name : "",
                    mobile_no : vendor_info != null ? vendor_info.mobile_no : "",
                    email : vendor_info != null ? vendor_info.email : "",
                    city : vendor_info != null ? vendor_info.city : "",
                    state : vendor_info != null ? vendor_info.state : "",
                    country : vendor_info != null ? vendor_info.country : "",
                    company_name : vendor_info != null ? vendor_info.company_name : ""
                };
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
                allocate_order_info: allocate_details
            })
        }

        let user_info = await user.findOne({_id: order_info.user_id});
        let user_address_info = await addressModel.findOne({_id: order_info.user_address_id});
        
        if(order_info.coupon_code_id != null && order_info.coupon_code_id != "null" && order_info.coupon_code_id != "" && order_info.coupon_code_id != undefined && order_info.coupon_code_id != "undefined"){coupon_code_info = await couponCodeModel.findOne({_id: order_info.coupon_code_id}).lean()};

        let obj = {
            _id : order_info._id,
            products : products,
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

async function invoice_no() {
    const detailsOrder = await orderModel.findOne().sort({ _id: -1 });
    let invoice = null;
    if(detailsOrder && detailsOrder.invoice_no != undefined && detailsOrder.invoice_no != null)
    {
        let index = detailsOrder.invoice_no.lastIndexOf("_");
        let result = detailsOrder.invoice_no.substr(index+1);
        invoice = "invoice_"+new Date().getTime()+"_"+(parseInt(result)+1);
    }
    else
    {
        invoice = "invoice_"+new Date().getTime()+"_1";
    }

    return invoice;
}

module.exports.order_details = order_details;
