const stripe = require("stripe")("sk_test_51Ln0BaER3286q4SVQmdoMJtU9ojFcSkiib9Rbui18b4TYReP5DMwxUlOrXk74HUxmSIXmi9GZuhQskd5xHjwDGmA00aUEUcF8b");

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

const mailFunction = require('../../config/mail');
exports.stripeCharge = async(req,res,next) => {
  console.log(req.body);

    // try {
    //     let { amount, id } = req.body;
    //     amount *= 100;
    //     amount = parseFloat(amount);

    //     const payment = await stripe.paymentIntents.create({
    //         amount: amount,
    //         currency: "AED",
    //         description: "Your Company Description",
    //         payment_method: id,
    //         confirm: true,
    //     });

    //     console.log("payment",payment)

    //     res.status(200).json({
    //         status:message.messages.TRUE,
    //         message:message.messages.DATA_GET_SUCCESSFULLY
    //     })
    // }
    // catch(error) {
    //     console.log("error",error);
    //     logger.error("error - "+error);
    //     res.status(400).json({
    //         status:message.messages.FALSE,
    //         message:error.message
    //     })
    // }
    const {paymentMethodType, currency, paymentMethodOptions} = req.body;
    console.log(paymentMethodType, currency, paymentMethodOptions);

  // Each payment method type has support for different currencies. In order to
  // support many payment method types and several currencies, this server
  // endpoint accepts both the payment method type and the currency as
  // parameters.
  //
  // Some example payment method types include `card`, `ideal`, and `alipay`.
  const params = {
    payment_method_types: [paymentMethodType],
    amount: 5999,
    currency: currency,
  }

  // If this is for an ACSS payment, we add payment_method_options to create
  // the Mandate.
  if(paymentMethodType === 'acss_debit') {
    params.payment_method_options = {
      acss_debit: {
        mandate_options: {
          payment_schedule: 'sporadic',
          transaction_type: 'personal',
        },
      },
    }
  } else if (paymentMethodType === 'konbini') {
    /**
     * Default value of the payment_method_options
     */
    params.payment_method_options = {
      konbini: {
        product_description: 'Tシャツ',
        expires_after_days: 3,
      },
    }
  } else if (paymentMethodType === 'customer_balance') {
    params.payment_method_data = {
      type: 'customer_balance',
    }
    params.confirm = true
    params.customer = req.body.customerId || await stripe.customers.create().then(data => data.id)
  }

  /**
   * If API given this data, we can overwride it
   */
  if (paymentMethodOptions) {
    params.payment_method_options = paymentMethodOptions
  }

  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  try {
    const paymentIntent = await stripe.paymentIntents.create(params);

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
      nextAction: paymentIntent.next_action,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
}