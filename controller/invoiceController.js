const fs = require('fs');
let path = require('path');
const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const message = require('../config/message');
var moment = require('moment');
const mongoose = require("mongoose");
var pdf = require("pdf-creator-node");
var html = fs.readFileSync(path.resolve(__dirname, "../html/template.html"), "utf8");
const order = require('../model/order');
const orderDetails = require('../model/orderDetails');
const orderController = require('../controller/api/orderController')
const address = require('../model/address');
const CouponCode = require('../model/couponCode');
const users = require('../model/user');
const invoice = require('../model/invoice')
const userController = require('../controller/authController')
const multer = require('multer');
const sharp = require('sharp');

exports.generateInvoice = async(req,res,next) => {
	try {
		var orders = await order.findOne({_id:req.params.id})
		
		const arr = x => Array.from(x);
		const num = x => Number(x) || 0;
		const str = x => String(x);
		const isEmpty = xs => xs.length === 0;
		const take = n => xs => xs.slice(0,n);
		const drop = n => xs => xs.slice(n);
		const reverse = xs => xs.slice(0).reverse();
		const comp = f => g => x => f (g (x));
		const not = x => !x;
		const chunk = n => xs =>
		isEmpty(xs) ? [] : [take(n)(xs), ...chunk (n) (drop (n) (xs))];

		// numToWords :: (Number a, String a) => a -> String
		let numToWords = n => {
		
		let a = [
			'', 'one', 'two', 'three', 'four',
			'five', 'six', 'seven', 'eight', 'nine',
			'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
			'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
		];
		
		let b = [
			'', '', 'twenty', 'thirty', 'forty',
			'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
		];
		
		let g = [
			'', 'thousand', 'million', 'billion', 'trillion', 'quadrillion',
			'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'
		];
		
		// this part is really nasty still
		// it might edit this again later to show how Monoids could fix this up
		let makeGroup = ([ones,tens,huns]) => {
			return [
			num(huns) === 0 ? '' : a[huns] + ' hundred ',
			num(ones) === 0 ? b[tens] : b[tens] && b[tens] + '-' || '',
			a[tens+ones] || a[ones]
			].join('');
		};
		
		let thousand = (group,i) => group === '' ? group : `${group} ${g[i]}`;
		
		if (typeof n === 'number')
			return numToWords(String(n));
		else if (n === '0')
			return 'zero';
		else
			return comp (chunk(3)) (reverse) (arr(n))
			.map(makeGroup)
			.map(thousand)
			.filter(comp(not)(isEmpty))
			.reverse()
			.join(' ');
		};

		let result = [];
		
		if(orders) {
			var orderdetails = await orderDetails.find({order_id:orders.order_id})
			var getinvoicedetails = await invoice.findOne({active:1, deleted_at: null})
			var gstamounts = 0;
			var totalamount = 0;
			let resultTemp = [];
			let data = await orderController.order_details(orders._id)
			console.log("data",data);
			resultTemp.push(data)
			// totalamount = data[1]
			// for (var detailsOrder of data[0]) {
			// 	var gstamount;
			// 	// console.log("yes get amount ",detailsOrder)
			// 	var get_amounts = parseInt(detailsOrder.gst) + 100
			// 	gstamounts += (detailsOrder.price * detailsOrder.gst) / get_amounts
			// 	gstamount = (detailsOrder.price * detailsOrder.gst) / get_amounts
			// 	detailsOrder['gst_amounts'] = parseInt(gstamount)
			// 	detailsOrder['color'] = detailsOrder.image.color_name
			// 	resultTemp.push(detailsOrder);
			// }
			// var delivery_price = await deliveryType.findOne({_id: orders.delivery_type_id}).select(["title","price"])
			var caseback = 0;
			var discount = 0;
			var title = '';
			var amount = 0;
			
			if(orders.coupon_code != null) {
				let couponCodeInfo = await CouponCode.findOne({_id : mongoose.Types.ObjectId(orders.coupon_code)});
				if (couponCodeInfo != null) {
					if(couponCodeInfo.coupontype_name == "discount") {
						discount = 1
						title = "Discount("+couponCodeInfo.coupon_name+")"
						amount = orders.discount
					}else {
						caseback = 1
						title = "CaseBack("+couponCodeInfo.coupon_name+")"
						amount = orders.discount
					}
				} 
			}
				

			if(resultTemp.length > 0)
			{
				let obj = {
					invoice_detail :  await invoice.find({active:1}).lean(),
					get_invoice_details : getinvoicedetails ? true : false,
					product: resultTemp,
					// total_amount: totalamount,
					total_number_word:numToWords(orders.total),
					invoice_no: orders.invoice_no,
					total_paid_amount: orders.total,
					wallet: orders.is_wallet == 1 ? true: false,
					walletamount:orders.wallet_amount > 0 ? orders.wallet_amount : 0,
					discount: orders.discount,
					coupon_code: null,
					// delivery_price : delivery_price != null && delivery_price.price > 0 ? 1 : 0,
					user_address_id: await address.findOne({_id: orders.user_address_id}).select(["address_name","houseno","address_line1","address_line2","city","pincode","state"]),
					// payment_mode_id: await paymentMode.findOne({_id: orders.payment_mode_id}).select(["name"]),
					// delivery_type_id: await deliveryType.findOne({_id: orders.delivery_type_id}).select(["title","price"]),
					gst: orders.gst == 1 ? true : false,
					// gst_details: await orderGstClaim.find({order_id: orders._id}).lean(),
					status: orders.status,
					is_placed: orders.is_placed,
					gst_amount:parseInt(gstamounts),
					created_at: userController.changeDateFormat(orders.created_at),
					caseback:caseback,
					discount:discount,
					title:title,
					CURRENCY:message.messages.CURRENCY,
					amount:amount
				}
				result.push(obj);
			}
		}
		var users = result

	var document = {
		html: html,
		data: {
			users: users,
		},
		path: "./pdf/"+orders.invoice_no+".pdf",
		type: "",
	};

	var options = {
        format: "A3",
        orientation: "portrait",
		border: "10mm",
        // header: {
        //     height: "10mm",
        //     contents: '<center><p style="font-size : 7px;font-style: oblique;font-weight: 500;">*This is a computer generated invoice and does not require a physical copy</p></center>'
        // },
        // footer: {
        //     height: "25mm",
        //     contents: '<p style="font-size : 8.5px;"><b>Declaration:</b> We hereby confirm that software supplied vide this invoice is acquired in a subsequent transfer and it is transferred without any modification and tax has been deducted under section 194J on payment during the previous transfer of such software deposited under PAN No: AAACZ4322M by the PAN Holder. Hence TDS need not be deducted on this invoice as per Notification No: 21/2012 ( F. No. 142/10/2012- SO 1323(E)), dated 13-06-2012 issued by the Ministry of Finance (CBDT) our PAN is AAACZ5230C.</p>'
        // }
	};

	

	pdf.create(document, options).then((res) => {
    	console.log("succsess",res)
  	})
  	.catch((error) => {
    	console.error("error",error);
  	});
		// 	console.log(res);
		//   })
		//   .catch((error) => {
		// 	console.error(error);
		//   });
	
		res.status(200).json({
			url:orders.invoice_no+".pdf",
			data:users,
			status:message.messages.TRUE,
			message:message.messages.DATA_ADD_SUCCESSFULLY
		})
		
	} catch (error) {
		console.log("error",error);
		res.status(400).json({
			status:message.messages.FALSE,
			message:message.messages.SOMETHING_WENT_WRONG
		})
	}
}

async function download_invoice(order_id) {
	try {
		var orders = await order.findOne({_id:order_id})
		
		const arr = x => Array.from(x);
		const num = x => Number(x) || 0;
		const str = x => String(x);
		const isEmpty = xs => xs.length === 0;
		const take = n => xs => xs.slice(0,n);
		const drop = n => xs => xs.slice(n);
		const reverse = xs => xs.slice(0).reverse();
		const comp = f => g => x => f (g (x));
		const not = x => !x;
		const chunk = n => xs =>
		isEmpty(xs) ? [] : [take(n)(xs), ...chunk (n) (drop (n) (xs))];

		// numToWords :: (Number a, String a) => a -> String
		let numToWords = n => {
		
		let a = [
			'', 'one', 'two', 'three', 'four',
			'five', 'six', 'seven', 'eight', 'nine',
			'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
			'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
		];
		
		let b = [
			'', '', 'twenty', 'thirty', 'forty',
			'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
		];
		
		let g = [
			'', 'thousand', 'million', 'billion', 'trillion', 'quadrillion',
			'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'
		];
		
		// this part is really nasty still
		// it might edit this again later to show how Monoids could fix this up
		let makeGroup = ([ones,tens,huns]) => {
			return [
			num(huns) === 0 ? '' : a[huns] + ' hundred ',
			num(ones) === 0 ? b[tens] : b[tens] && b[tens] + '-' || '',
			a[tens+ones] || a[ones]
			].join('');
		};
		
		let thousand = (group,i) => group === '' ? group : `${group} ${g[i]}`;
		
		if (typeof n === 'number')
			return numToWords(String(n));
		else if (n === '0')
			return 'zero';
		else
			return comp (chunk(3)) (reverse) (arr(n))
			.map(makeGroup)
			.map(thousand)
			.filter(comp(not)(isEmpty))
			.reverse()
			.join(' ');
		};

		let result = [];
		
		if(orders) {
			var orderdetails = await orderDetails.find({order_id:orders.order_id})
			var getinvoicedetails = await invoice.findOne({active:1, deleted_at: null})
			var gstamounts = 0;
			var totalamount = 0;
			let resultTemp = [];
			let data = await orderController.order_details(orders._id)
			console.log("data",data);
			resultTemp.push(data)
			// totalamount = data[1]
			// for (var detailsOrder of data[0]) {
			// 	var gstamount;
			// 	// console.log("yes get amount ",detailsOrder)
			// 	var get_amounts = parseInt(detailsOrder.gst) + 100
			// 	gstamounts += (detailsOrder.price * detailsOrder.gst) / get_amounts
			// 	gstamount = (detailsOrder.price * detailsOrder.gst) / get_amounts
			// 	detailsOrder['gst_amounts'] = parseInt(gstamount)
			// 	detailsOrder['color'] = detailsOrder.image.color_name
			// 	resultTemp.push(detailsOrder);
			// }
			// var delivery_price = await deliveryType.findOne({_id: orders.delivery_type_id}).select(["title","price"])
			var caseback = 0;
			var discount = 0;
			var title = '';
			var amount = 0;
			
			if(orders.coupon_code != null) {
				let couponCodeInfo = await CouponCode.findOne({_id : mongoose.Types.ObjectId(orders.coupon_code)});
				if (couponCodeInfo != null) {
					if(couponCodeInfo.coupontype_name == "discount") {
						discount = 1
						title = "Discount("+couponCodeInfo.coupon_name+")"
						amount = orders.discount
					}else {
						caseback = 1
						title = "CaseBack("+couponCodeInfo.coupon_name+")"
						amount = orders.discount
					}
				} 
			}
				

			if(resultTemp.length > 0)
			{
				let obj = {
					invoice_detail :  await invoice.find({active:1}).lean(),
					get_invoice_details : getinvoicedetails ? true : false,
					product: resultTemp,
					// total_amount: totalamount,
					total_number_word:numToWords(orders.total),
					invoice_no: orders.invoice_no,
					total_paid_amount: orders.total,
					wallet: orders.is_wallet == 1 ? true: false,
					walletamount:orders.wallet_amount > 0 ? orders.wallet_amount : 0,
					discount: orders.discount,
					coupon_code: null,
					// delivery_price : delivery_price != null && delivery_price.price > 0 ? 1 : 0,
					user_address_id: await address.findOne({_id: orders.user_address_id}).select(["address_name","houseno","address_line1","address_line2","city","pincode","state"]),
					// payment_mode_id: await paymentMode.findOne({_id: orders.payment_mode_id}).select(["name"]),
					// delivery_type_id: await deliveryType.findOne({_id: orders.delivery_type_id}).select(["title","price"]),
					gst: orders.gst == 1 ? true : false,
					// gst_details: await orderGstClaim.find({order_id: orders._id}).lean(),
					status: orders.status,
					is_placed: orders.is_placed,
					gst_amount:parseInt(gstamounts),
					created_at: userController.changeDateFormat(orders.created_at),
					caseback:caseback,
					discount:discount,
					CURRENCY:message.messages.CURRENCY,
					title:title,
					amount:amount
				}
				result.push(obj);
			}
		}
		console.log("result",result[0].product[0].products);
		var users = result

		var document = {
			html: html,
			data: {
				users: users,
			},
			path: "./pdf/"+orders.invoice_no+".pdf",
			type: "",
		};

		var options = {
			format: "A3",
			orientation: "portrait",
			border: "10mm",
		};

		pdf.create(document, options).then((res) => {
			console.log("succsess",res)
		})
		.catch((error) => {
			console.error("error",error);
		});
	
		return orders.invoice_no+".pdf";
		
	} catch (error) {
		console.log("error",error);
		return null;
	}
}

exports.createinvoicedesign = async(req,res,next) => {
	console.log("_________req.body",req.body);
	try {
		var invoic_img = '';
		var auth_img = '';
		for(var i = 0; i < req.files.length; i++)
                {
                    await sharp(req.files[i].path)
                        .resize(730, 648, {fit: sharp.fit.outside})
                        .toFile('uploads/'+req.files[i].filename);
                    fs.unlinkSync(req.files[i].path);

                    let fileInfo = 'uploads/'+req.files[i].filename, fileName = req.files[i].filename;

					if(i == 0) {
						invoic_img = fileInfo
					}
					if(i == 1) {
						auth_img  = fileInfo
					}
                }

		var invoicecreate = await invoice.create({
			invoice_image:invoic_img,
			invoice_name_with_address : req.body.address,
			name_of_state: req.body.name_of_state,
			license_order:  req.body.license_order,
			license_sent: req.body.license_sent,
			place_of_supply: req.body.place_of_supply,
			auth_logo: auth_img,
			auth_name: req.body.auth_name
		})
		res.status(200).json({
			status:message.messages.TRUE,
			message:message.messages.DATA_ADD_SUCCESSFULLY
		})
		
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status:message.messages.FALSE,
			message:message.messages.SOMETHING_WENT_WRONG
		})
	}
}

exports.deleteinvoice = async (req, res, next) => {
	try {
		var deleteproduct = await invoice.deleteOne({_id:req.query.id})
		res.status(200).json({
			status:message.messages.TRUE,
			message:message.messages.DATA_DELETE_SUCCESSFULLY
		})
	} catch (error) {
		res.status(400).json({
			status:message.messages.FALSE,
			message:message.messages.SOMETHING_WENT_WRONG
		})
	}
}

exports.getinvoice = async (req, res, next) => {
	try {
		var getinvoice = await invoice.find({deleted_at: null}).sort({_id: -1 }).limit(1)
		res.status(200).json({
			data:getinvoice,
			status:message.messages.TRUE,
			message:message.messages.DATA_GET_SUCCESSFULLY
		})
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status:message.messages.FALSE,
			message:message.messages.SOMETHING_WENT_WRONG
		})
	}
}

exports.getinvoicebyId = async (req, res, next) => {
	try {
		var getinvoice = await invoice.findOne({_id:req.params.id})
		res.status(200).json({
			data:getinvoice,
			status:message.messages.TRUE,
			message:message.messages.DATA_GET_SUCCESSFULLY
		})
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status:message.messages.FALSE,
			message:message.messages.SOMETHING_WENT_WRONG
		})
	}
}

exports.updateinvoicecategory = async(req, res, next) => {
	try {
        var getfeatureofmonthproduct = await invoice.find()
        for (let index = 0; index < getfeatureofmonthproduct.length; index++) {
            console.log(getfeatureofmonthproduct[index]._id);
            if (getfeatureofmonthproduct[index]._id.toString() == mongoose.Types.ObjectId(req.body.id).toString()) {
				console.log("Active");
                var str = await invoice.updateOne({_id:getfeatureofmonthproduct[index]._id},{$set:{active:req.body.status}})
            }else {
				console.log("InActive");
                var str = await invoice.updateOne({_id:getfeatureofmonthproduct[index]._id},{$set:{active:req.body.status}})
            }        
        }
        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_UPDATE_SUCCESSFULLY
        })
    } catch (error) {
		console.log(error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.PRODUCT_NOT_EXISTS
        })
    }
}

exports.updateinvoicedesign = async(req, res, next) => {
	try {
		
		let file = "", auth_file = "";

		if(req.files && req.files.invoice_logo != undefined && req.files.invoice_logo[0] != undefined && req.files.invoice_logo[0].destination){
			await sharp(req.files.invoice_logo[0].path)
			.resize(200, 200, {fit: sharp.fit.outside})
			.toFile('uploads/'+req.files.invoice_logo[0].filename);
			fs.unlinkSync(req.files.invoice_logo[0].path);

			file = 'uploads/'+req.files.invoice_logo[0].filename;
		}
		else
		{
			file = req.body.invoice_logo == "null" || req.body.invoice_logo == null ? "" : req.body.invoice_logo;
		}

		if(req.files && req.files.auth_logo != undefined && req.files.auth_logo[0] != undefined && req.files.auth_logo[0].destination){
			await sharp(req.files.auth_logo[0].path)
			.resize(200, 200, {fit: sharp.fit.outside})
			.toFile('uploads/'+req.files.auth_logo[0].filename);
			fs.unlinkSync(req.files.auth_logo[0].path);

			auth_file = 'uploads/'+req.files.auth_logo[0].filename;
		}
		else
		{
			auth_file = req.body.auth_logo == "null" || req.body.auth_logo == null ? "" : req.body.auth_logo;
		}

		var invoicecreate = await invoice.updateOne({_id:req.body.id},{$set:{
			invoice_name_with_address : req.body.address,
			name_of_state: req.body.name_of_state,
			license_order:  req.body.license_order,
			license_sent: req.body.license_sent,
			place_of_supply: req.body.place_of_supply,
			auth_name: req.body.auth_name,
			auth_logo: auth_file,
			invoice_image: file
		}})
		
		res.status(200).json({
			status:message.messages.TRUE,
			message:message.messages.DATA_UPDATE_SUCCESSFULLY
		})
	} catch (error) {
		console.log(error);
		res.status(400).json({
			status:message.messages.FALSE,
			message:message.messages.SOMETHING_WENT_WRONG
		})
	}
}

module.exports.download_invoice = download_invoice;