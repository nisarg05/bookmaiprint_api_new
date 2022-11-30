const user = require('../../model/user');
const address = require('../../model/address');
const otp = require('../../model/otp');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const date = require('date-and-time');
const message = require('../../config/message');
const mongoose = require("mongoose");
var FCM = require('fcm-node');
var serverKey = 'AIzaSyDBhIvqn5USZwg5RhDy97dKKCy-OcssmK4'; 
var fcm = new FCM(serverKey);
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const logger = require('../../utils/logger').logger;

const authController = require('../authController');
const mailFunction = require('../../config/mail');

exports.login = async(req,res,next) => {
    try {
        if(ValidateEmail(req.body.email))
        {
            var userExists = await user.findOne({email: req.body.email.toLowerCase(), role: 'user', deleted_at: null});
            if(userExists != "" && userExists != null)
            {
                if(userExists.is_blocked == 1 || userExists.is_blocked == "1")
                {
                    res.status(400).json({
                        status:message.messages.FALSE,
                        message:message.messages.BLOCKED_USER
                    })
                }
                else
                {
                    if(await bcrypt.compare(req.body.password, userExists.password))
                    {
                        const token = jwt.sign(
                            { user_id: userExists._id, email: req.body.email.toLowerCase()},
                            message.messages.JWT_STRING,
                            {
                                expiresIn: "24h",
                            }
                        );
            
                        await user.updateOne({email: userExists.email.toLowerCase()},{$set :{token:token}})
                                
                        res.status(200).json({
                            status:message.messages.TRUE,
                            message:message.messages.USER_LOGIN,
                            data:{
                                token: token,
                                user_details: await authController.user_details(userExists)
                            }
                        })
                    }
                    else
                    {
                        res.status(400).json({
                            status:message.messages.FALSE,
                            message:message.messages.PASSWORD_NOT_MATCH
                        })
                    }
                }
            }
            else
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.USER_NOT_EXISTS
                })
            }
        }
        else if(ValidatePhoneNumber(req.body.email))
        {
            var userExists = await user.findOne({mobile_no: req.body.email, role: 'user', deleted_at: null});
            console.log(userExists)
            if(userExists != "" && userExists != null)
            {
                if(userExists.is_blocked == 1 || userExists.is_blocked == "1")
                {
                    res.status(400).json({
                        status:message.messages.FALSE,
                        message:message.messages.BLOCKED_USER
                    })
                }
                else
                {
                    if(await bcrypt.compare(req.body.password, userExists.password))
                    {
                        const token = jwt.sign(
                            { user_id: userExists._id, email: req.body.email},
                            message.messages.JWT_STRING,
                            {
                                expiresIn: "24h",
                            }
                        );
            
                        await user.updateOne({mobile_no: userExists.mobile_no},{$set :{token:token}})
                                
                        res.status(200).json({
                            status:message.messages.TRUE,
                            message:message.messages.USER_LOGIN,
                            data:{
                                token: token,
                                user_details: await authController.user_details(userExists)
                            }
                        })
                    }
                    else
                    {
                        res.status(400).json({
                            status:message.messages.FALSE,
                            message:message.messages.PASSWORD_NOT_MATCH
                        })
                    }
                }
            }
            else
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.USER_NOT_EXISTS,
                })
            }
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
            })
        }
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.registration = async(req,res,next) => {
    try {
        let condition = [{email: req.body.email.toLowerCase()}]
        if(req.body.mobile_no != undefined && req.body.mobile_no != "undefined" && req.body.mobile_no != null && req.body.mobile_no != "null" && req.body.mobile_no != "")
        {
            condition.push({mobile_no: req.body.mobile_no});
        }

        var userExists = await user.findOne({
            role: req.body.role,
            deleted_at: null,
            $and: [
                { $or: condition }
            ]
        });
        

        if(userExists && userExists.is_registered == 1)// || userExists.is_registered == "1"
        {
            console.log("111");
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_ALREADY_REGISTERED
            })
        }
        else if(userExists && userExists.is_registered != 1)//|| userExists.is_registered != "1"
        {
            console.log("1");
            let otpExists = await otp.findOne({otp: req.body.otp, mobile_no: req.body.mobile_no, status: '0'})

            console.log(otpExists,"otpExists")

            let emailOtpExists = await otp.findOne({otp: req.body.email_otp, email_id: req.body.email, status: '0'})

            console.log(emailOtpExists,"emailOtpExists")

            if(otpExists && emailOtpExists)
            {
                let verifyOtp = await otp.findOneAndUpdate(
                    {mobile_no: req.body.mobile_no, status: '0', otp: req.body.otp},
                    {$set: {status: '1'}},
                    {new : true}
                );

                let emailVerifyOtp = await otp.findOneAndUpdate(
                    {email_id: req.body.email, status: '0', otp: req.body.email_otp},
                    {$set: {status: '1'}},
                    {new : true}
                );

                let encryptedPassword = await bcrypt.hash(req.body.password, 10);

                let userObj = {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    password: encryptedPassword,
                    mobile_no: req.body.mobile_no,
                    is_registered: 1
                }
    
                await user.updateOne({mobile_no: req.body.mobile_no},{$set :userObj})

                let userDetails = await user.findOne({email: req.body.email.toLowerCase()});

                const token = jwt.sign(
                    { user_id: userDetails._id, email: req.body.email.toLowerCase()},
                    message.messages.JWT_STRING,
                    {
                        expiresIn: "24h",
                    }
                );
    
                await user.updateOne({email: userDetails.email.toLowerCase()},{$set :{token:token}})
                        
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.USER_LOGIN,
                    data:{
                        token: token,
                        user_details: await authController.user_details(userDetails)
                    }
                })
            }
            else
            {
                console.log("ko");
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.OTP_NOT_EXISTS
                })
            }
        }
        else
        {
            console.log("11");
            let otpExists = await otp.findOne({otp: req.body.otp, mobile_no: req.body.mobile_no, status: '0'})

            if(otpExists)
            {
                let verifyOtp = await otp.findOneAndUpdate(
                    {mobile_no: req.body.mobile_no, status: '0', otp: req.body.otp},
                    {$set: {status: '1'}},
                    {new : true}
                );

                let userDetails = await authController.create_user(req.body);

                const token = jwt.sign(
                    { user_id: userDetails._id, email: req.body.email.toLowerCase()},
                    message.messages.JWT_STRING,
                    {
                        expiresIn: "24h",
                    }
                );
    
                await user.updateOne({email: userDetails.email.toLowerCase()},{$set :{token:token}})
                        
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.USER_LOGIN,
                    data:{
                        token: token,
                        user_details: await authController.user_details(userDetails)
                    }
                })
            }
            else
            {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.OTP_NOT_EXISTS
                })
            }
        }
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.updateUser = async(req,res,next) => {
    try {
        let user_id = req.user != null && req.user.user_id != undefined && req.user.user_id != null && req.user.user_id != "" ? req.user.user_id : null;
        var userExists = await user.findOne({_id: req.body.id, role: 'user', deleted_at: null});
        if(userExists)
        {
            let userObj = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                mobile_no: req.body.mobile_no,
                mobile_no_2: req.body.mobile_no_2,
                gender: req.body.gender,
                company_name: req.body.company_name
            }

            await user.updateOne({_id: req.body.id},{$set :userObj})

            if(req.body.address_id != "" && req.body.address_id != null && req.body.address_id != "null")
            {
                let updateAddressDetails = {
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
                    updated_at: new Date().getTime(),
                    updated_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                }

                await address.updateOne({_id: req.body.address_id},{$set :updateAddressDetails})
            }
            else
            {
                const newAddress = new address(
                    {
                        name: req.body.first_name+" "+req.body.last_name,
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
                        user_id: req.body.id != undefined && req.body.id != "undefined" && req.body.id != null && req.body.id != "null" && req.body.id != '' ? mongoose.Types.ObjectId(req.body.id) : null,
                        created_at: new Date().getTime(),
                        created_by: user_id != null ? mongoose.Types.ObjectId(user_id) : null
                    }
                )
        
                await newAddress.save();
            }
                                
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY,
                data:await authController.user_details(userExists)
            })
        }
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
            })
        }
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.getOtp = async(req,res,next) => {
    try {
        let otpExists = await otp.findOne({mobile_no: req.body.mobile_no, status: '0'})
        let emailOtpExists = await otp.findOne({email_id: req.body.email_id, status: '0'})

        if(otpExists)
        {
            let verifyOtp = await otp.findOneAndUpdate(
                {mobile_no: req.body.mobile_no, status: '0'},
                {$set: {status: '2'}},
                {new : true}
            );
        }

        if(emailOtpExists)
        {
            let verifyOtp = await otp.findOneAndUpdate(
                {email_id: req.body.email_id, status: '0'},
                {$set: {status: '2'}},
                {new : true}
            );
        }

        var otpString = await generateOtp();
        var emailOtpString = await generateOtp();

        var otpExistsCheck = await otp.find({otp: otpString});
        var emailOtpExistsCheck = await otp.find({otp: emailOtpString});

        if(otpExistsCheck != "")
        {
            otpString = await generateOtp();
        }

        if(emailOtpExistsCheck != "")
        {
            emailOtpString = await generateOtp();
        }


        const newOtp = new otp(
            {
                mobile_no: req.body.mobile_no,
                otp: otpString
            }
        );

        await newOtp.save();

        const newEmailOtp = new otp(
            {
                email_id: req.body.email_id,
                otp: emailOtpString
            }
        );

        await newEmailOtp.save();

        //await mailFunction.send_mail(req.body.email_id, "OTP for registration", "Your otp for registration is : "+emailOtpString);

        res.status(200).json({
            status:message.messages.TRUE,
            message:message.messages.DATA_ADD_SUCCESSFULLY,
            data: {
                otp: otpString,
                email: emailOtpString
            }
        })
    }
    catch(error) {
        console.log("error",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.getVerifyOtp = async(req, res, next) => {
    try {
        console.log(req.body)
        if(req.body.obj.type == 'number') {
            let otpExists = await otp.findOne({otp: req.body.obj.otp, mobile_no: req.body.obj.mobile_no, status: '0'})
            console.log(otpExists)
            if(otpExists) {
                let verifyOtp = await otp.findOneAndUpdate(
                    {mobile_no: req.body.obj.mobile_no, status: '0', otp: req.body.obj.otp},
                    {$set: {status: '1'}},
                    {new : true}
                );
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_GET_SUCCESSFULLY
                })
            } else {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.OTP_NOT_EXISTS
                })
            }
        } else {
            let emailOtpExists = await otp.findOne({otp: req.body.obj.otp, email_id: req.body.obj.email_id, status: '0'})
            if(emailOtpExists) {
                let emailVerifyOtp = await otp.findOneAndUpdate(
                    {email_id: req.body.obj.email, status: '0', otp: req.body.obj.otp},
                    {$set: {status: '1'}},
                    {new : true}
                );
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.DATA_GET_SUCCESSFULLY
                })
            } else {
                res.status(400).json({
                    status:message.messages.FALSE,
                    message:message.messages.OTP_NOT_EXISTS
                })
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

exports.changePassword = async(req, res, next) => {
    try {
        console.log(req.body.obj.password)
        if(req.body.obj.type == 'number') {
            let encryptedPassword = await bcrypt.hash(req.body.obj.password, 10);
            var str = await user.updateOne({mobile_no:req.body.obj.mobile_no},{$set:{password:encryptedPassword}})
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        } else {
            let encryptedPassword = await bcrypt.hash(req.body.obj.password, 10);
            var str = await user.updateOne({email:req.body.obj.email},{$set:{password:encryptedPassword}})
            res.status(200).json({
                status:message.messages.TRUE,
                message:message.messages.DATA_UPDATE_SUCCESSFULLY
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status:message.messages.FALSE,
            message:message.messages.SOMETHING_WENT_WRONG
        })
    }
}

function ValidateEmail(email)
{
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function ValidatePhoneNumber(contactNo)
{
    return /^-?\d+$/.test(contactNo);
}

async function generateOtp() {
    var otpString = otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    var otpExists = await otp.find({otp: otpString});

    if(otpExists != "")
    {
        otpString = otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });
    }

    return otpString;
}
