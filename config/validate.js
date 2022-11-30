const { check, validationResult } = require('express-validator');
const msgFormat = ({msg, param}) => {
    return {
        param: param,
        message: msg
    }
};
const mongoose = require("mongoose");
const user = require('../model/user');
const category = require('../model/category');
const inquiry = require('../model/inquiry');
const question = require('../model/question');
const answer = require('../model/answer');
const priceList = require('../model/priceList');
const package = require('../model/package');
const address = require('../model/address');
const menuModal = require('../model/menu');
const page = require('../model/page');
const otp = require('../model/otp');
const vendorRegister = require('../model/vendorRegister');
const message = require('../config/message')
const vendorQuestion = require('../model/vendorQuestion');
const vendorAnswer = require('../model/vendorAnswer');
const vendorPriceList = require('../model/vendorPriceList');

exports.validateAdminLogin = [
    check('email').not().isEmpty().withMessage(message.messages.EMAIL_REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            user.count({email:req.body.email, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.USER_EMAIL_NOT_EXISTS))
                }
            });
        });
    }),
    check('password').not().isEmpty().withMessage(message.messages.PASS_REQUIRED),
    check('role').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validatePassword = [
    check('email').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            user.count({email:req.body.email, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.USER_NOT_EXISTS))
                }
            });
        });
    }),
    check('password').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('new_password').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('role').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUserPassword = [
    check('password').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('new_password').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertUser = [
    check('email').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            user.count({email:req.body.email, deleted_at:null}).then(function(location, err){
                if(location > 0) {
                    reject(new Error(message.messages.USER_ALREADY_REGISTERED))
                }
                else {
                    resolve(true)
                }
            });
        });
    }),
    check('password').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('role').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('first_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('last_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateUser = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            user.count({_id: mongoose.Types.ObjectId(req.body.id), deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.USER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateDeleteUser = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            user.count({_id: mongoose.Types.ObjectId(req.body.id)}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.USER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertCategory = [
    check('name').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            category.count({name:req.body.name, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    reject(new Error(message.messages.CATEGORY_NAME_EXISTS))
                }
                else {
                    resolve(true)
                }
            });
        });
    }),
    check('parent_id').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.parent_id != null && req.body.parent_id != 'null' && req.body.parent_id != "" && req.body.parent_id != undefined  && req.body.parent_id != "undefined")
            {
                category.count({_id: mongoose.Types.ObjectId(req.body.parent_id), deleted_at: null}).then(function(location, err){
                    if(location > 0) {
                        resolve(true)
                    }
                    else {
                        reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                    }
                });
            }
            else
            {
                resolve(true)   
            }
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateCategory = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            category.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                }
            });
        });
    }),
    check('name').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.name != null && req.body.name != "" && req.body.name != undefined)
            {
                category.findOne({name:req.body.name}).then(function(location, err){
                    if(category) {
                        if(category.name == req.body.name)
                        {
                            reject(new Error(message.messages.CATEGORY_NAME_EXISTS))
                        }
                        else
                        {
                            resolve(true)    
                        }
                    }
                    else {
                        resolve(true)
                    }
                });
            }
            else
            {
                resolve(true)
            }
        });
    }),
    check('parent_id').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.parent_id != null && req.body.parent_id != 'null' && req.body.parent_id != "" && req.body.parent_id != undefined  && req.body.parent_id != "undefined")
            {
                category.count({_id: mongoose.Types.ObjectId(req.body.parent_id), deleted_at: null}).then(function(location, err){
                    if(location > 0) {
                        resolve(true)
                    }
                    else {
                        reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                    }
                });
            }
            else
            {
                resolve(true)   
            }
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertInquiry = [
    check('name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('mobile_no').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('product_details').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertSubscription = [
    check('email').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateDeleteInquiry = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            inquiry.count({_id: mongoose.Types.ObjectId(req.body.id)}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.INQUIRY_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertQuestion = [
    check('question').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('category_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            category.count({_id:req.body.category_id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    question.count({category_id:req.body.category_id, answer_id: null, deleted_at: null}).then(function(location, err){
                        if(req.body.answer_id != null && req.body.answer_id != 'null' && req.body.answer_id != "" && req.body.answer_id != undefined  && req.body.answer_id != "undefined")
                        {
                            resolve(true)
                        }
                        else {
                            if(location > 0) {
                                reject(new Error(message.messages.ONE_QUESTION_EXISTS))
                            }
                            else {
                                resolve(true)
                            }
                        }
                    });
                }
                else {
                    reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                }
            });
        });
    }),
    check('answer_id').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.answer_id != null && req.body.answer_id != 'null' && req.body.answer_id != "" && req.body.answer_id != undefined  && req.body.answer_id != "undefined")
            {
                answer.count({_id: mongoose.Types.ObjectId(req.body.answer_id), deleted_at: null}).then(function(location, err){
                    if(location > 0) {
                        resolve(true)
                    }
                    else {
                        reject(new Error(message.messages.ANSWER_NOT_EXISTS))
                    }
                });
            }
            else
            {
                resolve(true)   
            }
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateQuestion = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            question.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.QUESTION_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertAnswer = [
    check('option').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('question_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            question.count({_id:req.body.question_id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.QUESTION_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateAnswer = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            answer.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.ANSWER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateDeleteAnswer = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            answer.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.ANSWER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertPackage = [
    check('title').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            package.count({title:req.body.title, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    reject(new Error(message.messages.PACKAGE_NAME_EXISTS))
                }
                else {
                    resolve(true)
                }
            });
        });
    }),
    check('category_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            category.count({_id: mongoose.Types.ObjectId(req.body.category_id), deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                }
            });
        });
    }),
    check('charge').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdatePackage = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            package.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.PACKAGE_NOT_EXISTS))
                }
            });
        });
    }),
    check('title').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.title != null && req.body.title != "" && req.body.title != undefined)
            {
                package.findOne({title:req.body.title}).then(function(location, err){
                    if(package) {
                        if(package.title == req.body.title)
                        {
                            reject(new Error(message.messages.PACKAGE_NAME_EXISTS))
                        }
                        else
                        {
                            resolve(true)    
                        }
                    }
                    else {
                        resolve(true)
                    }
                });
            }
            else
            {
                resolve(true)
            }
        });
    }),
    check('category_id').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.category_id != null && req.body.category_id != 'null' && req.body.category_id != "" && req.body.category_id != undefined  && req.body.category_id != "undefined")
            {
                category.count({_id: mongoose.Types.ObjectId(req.body.category_id), deleted_at: null}).then(function(location, err){
                    if(location > 0) {
                        resolve(true)
                    }
                    else {
                        reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                    }
                });
            }
            else
            {
                resolve(true)   
            }
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertAddress = [
    check('name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('house_no').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('address_line_1').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('city').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('pincode').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateAddress = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            address.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.ADDRESS_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateRegisterUser = [
    check('otp').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('email').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('mobile_no').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('password').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('role').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('first_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('last_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateUserApi = [
    check('email').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('mobile_no').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('first_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('last_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('house_no').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('address_line_1').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('landmark').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('city').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('pincode').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertCouponCode = [
    check('coupon_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('coupontype_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('expire_date').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateCouponCode = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('coupon_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('coupontype_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('expire_date').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateAppliedCouponCode = [
    check('coupon_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('category_id').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('price_list_id').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertSetting = [
    check('description').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('sort_description').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('upload_file_description').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('subscription_description').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('footer_descrption').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('footer_copy_rights').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertMenu = [
    check('slug').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('title').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertPage = [
    check('title').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('menu_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            menuModal.count({_id:req.body.menu_id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.MENU_NOT_EXISTS))
                }
            });
        });
    }),
    check('sort_description').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('description').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdatePage = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            page.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.PAGE_NOT_EXISTS))
                }
            });
        });
    }),
    check('title').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('menu_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            menuModal.count({_id:req.body.menu_id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.MENU_NOT_EXISTS))
                }
            });
        });
    }),
    check('sort_description').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('description').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateInsertVendor = [
    check('email').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            vendorRegister.count({email:req.body.email, deleted_at:null}).then(function(location, err){
                if(location > 0) {
                    reject(new Error(message.messages.USER_ALREADY_REGISTERED))
                }
                else {
                    resolve(true)
                }
            });
        });
    }),
    check('password').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('first_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('last_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('company_name').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('website').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('mobile_no').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('address').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('city').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('state').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('country').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('pincode').not().isEmpty().withMessage(message.messages.REQUIRED),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateUpdateVendor = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            vendorRegister.count({_id: mongoose.Types.ObjectId(req.body.id), deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.USER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateDeleteVendor = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            vendorRegister.count({_id: mongoose.Types.ObjectId(req.body.id)}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.USER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateVendorInsertAnswer = [
    check('option').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('question_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            vendorQuestion.count({_id:req.body.question_id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.QUESTION_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateVendorUpdateAnswer = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            vendorAnswer.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.ANSWER_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateVendorInsertQuestion = [
    check('question').not().isEmpty().withMessage(message.messages.REQUIRED),
    check('category_id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            category.count({_id:req.body.category_id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    vendorQuestion.count({category_id:req.body.category_id, answer_id: null, deleted_at: null}).then(function(location, err){
                        if(req.body.answer_id != null && req.body.answer_id != 'null' && req.body.answer_id != "" && req.body.answer_id != undefined  && req.body.answer_id != "undefined")
                        {
                            resolve(true)
                        }
                        else {
                            if(location > 0) {
                                reject(new Error(message.messages.ONE_QUESTION_EXISTS))
                            }
                            else {
                                resolve(true)
                            }
                        }
                    });
                }
                else {
                    reject(new Error(message.messages.CATEGORY_NOT_EXISTS))
                }
            });
        });
    }),
    check('answer_id').custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            if(req.body.answer_id != null && req.body.answer_id != 'null' && req.body.answer_id != "" && req.body.answer_id != undefined  && req.body.answer_id != "undefined")
            {
                vendorAnswer.count({_id: mongoose.Types.ObjectId(req.body.answer_id), deleted_at: null}).then(function(location, err){
                    if(location > 0) {
                        resolve(true)
                    }
                    else {
                        reject(new Error(message.messages.ANSWER_NOT_EXISTS))
                    }
                });
            }
            else
            {
                resolve(true)   
            }
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];

exports.validateVendorUpdateQuestion = [
    check('id').not().isEmpty().withMessage(message.messages.REQUIRED).bail().custom((value, {req}) => {
        return new Promise((resolve, reject) => {
            vendorQuestion.count({_id:req.body.id, deleted_at: null}).then(function(location, err){
                if(location > 0) {
                    resolve(true)
                }
                else {
                    reject(new Error(message.messages.QUESTION_NOT_EXISTS))
                }
            });
        });
    }),
    function(req, res, next) {
        var errors = validationResult(req).formatWith(msgFormat);
        if (!errors.isEmpty()) {
            res.status(400).json({
                status:message.messages.FALSE,
                message:errors.array()
            })
        } else {
            next();
        }
    }
];