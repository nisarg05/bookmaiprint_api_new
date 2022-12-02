const nodemailer = require('nodemailer');
const SMTPConnection = require("nodemailer/lib/smtp-connection");

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       user: 'bhoomiqf@gmail.com',
       pass: 'rycqpmlajneuxggb'
    }
});

async function send_mail(email, title, data) {
    const message = {
        from: 'bhoomiqf@gmail.com', // Sender address
        to: "email", // List of recipients
        subject: title, // Subject line
        html: "<h5 class='mt-2'>"+data+"</h5>" // Plain text body
    };
    console.log("--------data", data);

    transport.sendMail(message, function(err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info);
        }
    });

    return true;
}

module.exports.send_mail = send_mail;