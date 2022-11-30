const couponCodeModel = require('../../model/couponCode');
const categoryModel = require('../../model/category');
const priceListModel = require('../../model/priceList');
const orderModel = require('../../model/order');
const user = require('../../model/user');

const message = require('../../config/message');
const date = require('date-and-time');
const mongoose = require("mongoose");

const categoryController = require('../categoryController');
const userController = require('../authController');
const logger = require('../../utils/logger').logger;

// exports.applyCouponCode = async(req,res,next) => {
//     try {
//         let user_id = req.user == null || req.user == "" || req.user == "null" ? null : mongoose.Types.ObjectId(req.user.user_id), is_already_login = true;

//         if(user_id == null)
//         {
//             is_already_login = false;
//             let userDetails = await user.findOne({mobile_no: req.body.mobile_no});
//             if(userDetails)
//             {
//                 user_id = mongoose.Types.ObjectId(userDetails._id);
//             }
//         }

//         let checkCouponCode = await couponCodeModel.findOne({coupon_name:req.body.coupon_name});
        
//         if(checkCouponCode)
//         {
//             let checkPrice = await priceListModel.findOne({qty:req.body.qty, category_id: req.body.category_id, answer_id: req.body.answer_id, is_enable: 1});

//             if(checkPrice)
//             {
//                 let orderDetailsExists = await orderModel.findOne({status:{ $in: ["pending","confirmed","payment_failed","delivered","return","in_transit"] }, coupon_code_id:mongoose.Types.ObjectId(checkCouponCode._id), user_id:mongoose.Types.ObjectId(user_id)});

//                 if(orderDetailsExists)
//                 {
//                     res.status(400).json({
//                         status:message.messages.FALSE,
//                         message:message.messages.COUPON_CODE_ALREADY_USED
//                     })
//                 }
//                 else
//                 {
//                     var obj;
//                     if(checkCouponCode.coupontype_name == "Percentage")
//                     {
//                         if(checkPrice.price > checkCouponCode.percantage_min_order_val){
//                             var discounted_amount = (checkPrice.price*checkCouponCode.percantage_value/100)
//                             var actual_amount = checkPrice.price
//                             if(checkCouponCode.percantage_max_value>discounted_amount){
//                                 var amount_after_discount = (checkPrice.price-discounted_amount)
//                             }else{
//                                 var discounted_amount = checkCouponCode.percantage_max_value
//                                 var amount_after_discount = (checkPrice.price-checkCouponCode.percantage_max_value)
//                             }
                            
//                             obj = {
//                                 _id: checkCouponCode._id,
//                                 coupon_name: checkCouponCode.coupon_name,
//                                 coupontype_name: checkCouponCode.coupontype_name,
//                                 discounted_amount: discounted_amount,
//                                 actual_order_amount: actual_amount,
//                                 amount_after_discount:amount_after_discount
//                             }

//                             res.status(200).json({
//                                 status:message.messages.TRUE,
//                                 data:obj,
//                                 message:message.messages.COUPON_CODE_APPLIED
//                             })
//                         }else{
//                             res.status(200).json({
//                                 status:message.messages.TRUE,
//                                 message:message.messages.COUPON_CODE_MIN_ORDER_VALUE
//                             })
//                         }
//                     }
//                     else if (checkCouponCode.coupontype_name == "Flat")
//                     {
//                         if(checkPrice.price > checkCouponCode.flat_min_order_val){
//                             var discounted_amount = checkCouponCode.flat_value
//                             var actual_amount = checkPrice.price
//                             var amount_after_discount = (checkPrice.price - checkCouponCode.flat_value)

//                             obj = {
//                                 _id: checkCouponCode._id,
//                                 coupon_name: checkCouponCode.coupon_name,
//                                 coupontype_name: checkCouponCode.coupontype_name,
//                                 discounted_amount: discounted_amount,
//                                 actual_order_amount: actual_amount,
//                                 amount_after_discount:amount_after_discount
//                             }

//                             res.status(200).json({
//                                 data:obj,
//                                 status:message.messages.TRUE,
//                                 message:message.messages.COUPON_CODE_APPLIED
//                             })
//                         }else{
//                             res.status(200).json({
//                                 status:message.messages.TRUE,
//                                 message:message.messages.COUPON_CODE_MIN_ORDER_VALUE
//                             })
//                         }
//                     }
//                 }
//             }
//             else
//             {
//                 res.status(400).json({
//                     status:message.messages.FALSE,
//                     message:message.messages.PRICE_NOT_EXISTS
//                 })
//             }
//         }
//         else
//         {
//             res.status(400).json({
//                 status:message.messages.FALSE,
//                 message:message.messages.COUPON_CODE_NOT_EXISTS
//             })
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(400).json({
//           status:message.messages.FALSE,
//           message:error
//       })
//     }
// }

exports.applyCouponCode = async(req,res,next) => {
    try {
        let user_id = req.user == null || req.user == "" || req.user == "null" ? null : mongoose.Types.ObjectId(req.user.user_id), is_already_login = true, orderDetailsExists = null;

        if(user_id == null)
        {
            is_already_login = false;
            let userDetails = await user.findOne({mobile_no: req.body.mobile_no});
            if(userDetails)
            {
                user_id = mongoose.Types.ObjectId(userDetails._id);
            }
        }

        let checkCouponCode = await couponCodeModel.findOne({coupon_name:req.body.coupon_name});
        
        if(checkCouponCode)
        {
            var notExpireCode = await couponCodeModel.findOne({coupon_name:req.body.coupon_name, expire_date:{$gte:new Date().getTime()}});
            
            if(notExpireCode)
            {
		    var total_amount = 0;
		    for(i = 0; i < req.body.category_id.length; i++)
		    {
		        let priceListInfo = await priceListModel.findOne({_id: req.body.price_list_id[i], is_enable: 1})
		        if(priceListInfo)
		        {
		            total_amount = total_amount + priceListInfo.price;
		        }
		    }
            
		    if(user_id != null)
		    {
		        orderDetailsExists = await orderModel.findOne({status:{ $in: ["pending","confirmed","payment_failed","delivered","return","in_transit"] }, coupon_code_id:mongoose.Types.ObjectId(checkCouponCode._id), user_id:mongoose.Types.ObjectId(user_id)});
		    }

		    if(orderDetailsExists)
		    {
		        res.status(400).json({
		            status:message.messages.FALSE,
		            message:message.messages.COUPON_CODE_ALREADY_USED
		        })
		    }
		    else
		    {
		        var obj;
		        if(checkCouponCode.coupontype_name == "Percentage")
		        {
		            var discounted_amount = (total_amount*checkCouponCode.percantage_value/100)
		            if(!checkCouponCode.percantage_max_value>discounted_amount){
		                var discounted_amount = checkCouponCode.percantage_max_value
		            }

		            var amount_after_discount = (total_amount-discounted_amount)

		            obj = {
		                _id: checkCouponCode._id,
		                coupon_name: checkCouponCode.coupon_name,
		                coupontype_name: checkCouponCode.coupontype_name,
		                discounted_amount: discounted_amount,
		                actual_order_amount: total_amount,
		                amount_after_discount:amount_after_discount
		            }

		            res.status(200).json({
		                status:message.messages.TRUE,
		                data:obj,
		                message:message.messages.COUPON_CODE_APPLIED
		            })
		        }
		        else if (checkCouponCode.coupontype_name == "Flat")
		        {
		            var discounted_amount = checkCouponCode.flat_value
		            var amount_after_discount = (total_amount-discounted_amount)

		            obj = {
		                _id: checkCouponCode._id,
		                coupon_name: checkCouponCode.coupon_name,
		                coupontype_name: checkCouponCode.coupontype_name,
		                discounted_amount: discounted_amount,
		                actual_order_amount: total_amount,
		                amount_after_discount:amount_after_discount
		            }

		            res.status(200).json({
		                status:message.messages.TRUE,
		                data:obj,
		                message:message.messages.COUPON_CODE_APPLIED
		            })
		        }
		    }
		}
		else
		{
			res.status(400).json({
				status:message.messages.FALSE,
				message:message.messages.COUPON_CODE_EXPIRED
			    })
		}
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.COUPON_CODE_NOT_MATCH
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
          status:message.messages.FALSE,
          message:error
      })
    }
}
