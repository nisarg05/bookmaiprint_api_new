const user = require('../model/vendorRegister');
const address = require('../model/address');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const date = require('date-and-time');
const message = require('../config/message');
const mongoose = require("mongoose");
var FCM = require('fcm-node');
var serverKey = 'AIzaSyDBhIvqn5USZwg5RhDy97dKKCy-OcssmK4'; 
var fcm = new FCM(serverKey);
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const logger = require('../utils/logger').logger;

const crypto = require('crypto');
const algorithm = "aes-256-cbc"; 
const initVector = crypto.randomBytes(16);
var key = 'password';
const Securitykey = crypto.randomBytes(32);

const vendorRegisterController = require('../controller/vendorRegisterController');

exports.adminLogin = async(req,res,next) => {
    try {
        console.log("ji");
        var userExists = await user.findOne({email: req.body.email.toLowerCase()});
        console.log(userExists);
        if(userExists != "" && userExists != null)
        {
            var decipher = crypto.createDecipher(algorithm, key);
            var decrypted = decipher.update(userExists.password, 'hex', 'utf8') + decipher.final('utf8');
            console.log("decrypted",decrypted)
            console.log("req.body.password",req.body.password)

            if(decrypted === req.body.password)
            {
                const token = jwt.sign(
                    { user_id: userExists._id, email: req.body.email.toLowerCase()},
                    message.messages.JWT_STRING,
                    {
                        expiresIn: "2h",
                    }
                );

                await user.updateOne({email: userExists.email.toLowerCase()},{$set :{token:token}})
                        
                res.status(200).json({
                    status:message.messages.TRUE,
                    message:message.messages.USER_LOGIN,
                    data:{
                        token: token,
                        user_details: await vendorRegisterController.user_details(userExists)
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
        else
        {
            res.status(400).json({
                status:message.messages.FALSE,
                message:message.messages.USER_NOT_EXISTS
            })
        }
    }
    catch(error) {
        console.log("error 1",error);
        logger.error("error - "+error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}