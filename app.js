const http = require("http")
const express = require('express')
const app = express()
const server   = require('http').Server(app)
const bodyParser = require('body-parser');
require("./config/database").connect();
const auth = require("./middleware/auth");
var cors = require('cors')
var MongoClient = require('mongodb').MongoClient;  
const openpgp = require('openpgp');
var CryptoJS = require("crypto-js");

const routes = require('./routes/route.js');

app.use(bodyParser.urlencoded({ limit: "100mb",extended: true }));
app.use(bodyParser.json({limit: "100mb"}));

app.use(cors());
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use('/logo',express.static(__dirname + '/logo'));
app.use('/pdf',express.static(__dirname + '/pdf'));

app.use('/', routes); 

const webhookModel = require('./model/webhook');
const { json } = require("body-parser");

async function generate() {
    const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
        type: 'ecc', // Type of the key, defaults to ECC
        curve: 'curve25519', // ECC curve name, defaults to curve25519
        userIDs: [{ name: 'Bhoomi Makwana', email: 'bhoomiqf@gmail.com' }], // you can pass multiple user IDs
        passphrase: 'openpgp secret key for book my print.', // protects the private key
        format: 'armored' // output key format, defaults to 'armored' (other options: 'binary' or 'object')
    });

    console.log(privateKey);     // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
    console.log(publicKey);      // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
    console.log(revocationCertificate); // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
}

app.post("/hook",async function(req, res) {
    try{
        // const publicKeyArmored = `xjMEYysPixYJKwYBBAHaRw8BAQdAz2Yyj9LSK6hQzqvUlPaVrS0MIYLOj8WG
        // 6af8AkxKNmPNI0Job29taSBNYWt3YW5hIDxiaG9vbWlxZkBnbWFpbC5jb20+
        // wowEEBYKAB0FAmMrD4sECwkHCAMVCAoEFgACAQIZAQIbAwIeAQAhCRCwvVhA
        // PPgYWBYhBFDBBZliJkM66GbBMbC9WEA8+BhYBPQA/jvt8QK0FxCrFblKXnsd
        // SjXTPbCZhchUuOnG9XPVxdldAQDRZbpQcq/Rp1I7Q+uz0t5xY9lvIJ4o6cSR
        // xD0msNy4Ds44BGMrD4sSCisGAQQBl1UBBQEBB0DcFssGBkvnm//26Yon6aXy
        // q0dSUr2Vv9CbCmTpHvPVPgMBCAfCeAQYFggACQUCYysPiwIbDAAhCRCwvVhA
        // PPgYWBYhBFDBBZliJkM66GbBMbC9WEA8+BhYWYEA/ifxAOmEA97p8NB3YZ/K
        // X46uLCnoZMkf07Nd50evdqF5AQD6yPZ4lKreJexdPGhUwVAx48AHlUYh8EMK
        // cgFg8zIhCg==
        // =vyg+`;

        // const privateKeyArmored = `xYYEYysPixYJKwYBBAHaRw8BAQdAz2Yyj9LSK6hQzqvUlPaVrS0MIYLOj8WG
        // 6af8AkxKNmP+CQMI29T4rNHUq23gt2G/3mX3xno7UDNRn4GBm2JWlb4Eh4LQ
        // PVkktisOKnLcIUf5gGcwZbt5ELE/FKK6r4lqbOYEB4L0QVQjh4k8x9qNKcWD
        // M80jQmhvb21pIE1ha3dhbmEgPGJob29taXFmQGdtYWlsLmNvbT7CjAQQFgoA
        // HQUCYysPiwQLCQcIAxUICgQWAAIBAhkBAhsDAh4BACEJELC9WEA8+BhYFiEE
        // UMEFmWImQzroZsExsL1YQDz4GFgE9AD+O+3xArQXEKsVuUpeex1KNdM9sJmF
        // yFS46cb1c9XF2V0BANFlulByr9GnUjtD67PS3nFj2W8gnijpxJHEPSaw3LgO
        // x4sEYysPixIKKwYBBAGXVQEFAQEHQNwWywYGS+eb//bpiifppfKrR1JSvZW/
        // 0JsKZOke89U+AwEIB/4JAwj+7IhYCXL3UeC/39HMWWyrsNeEYApxAeonpPTb
        // nHzlifcgry/21WVrdKT01psjSTx1c38vk9nqsh2Hu3ozmBABL2e6aRgBKOKj
        // 2lp3bB6OwngEGBYIAAkFAmMrD4sCGwwAIQkQsL1YQDz4GFgWIQRQwQWZYiZD
        // OuhmwTGwvVhAPPgYWFmBAP4n8QDphAPe6fDQd2Gfyl+Oriwp6GTJH9OzXedH
        // r3aheQEA+sj2eJSq3iXsXTxoVMFQMePAB5VGIfBDCnIBYPMyIQo=
        // =kzbh`;

        // const passphrase = `openpgp secret key for book my print.`;

        // const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

        // const privateKey = await openpgp.decryptKey({
        //     privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        //     passphrase
        // });

        // var myData = new webhookModel({"description":JSON.stringify(req.body)});
        // myData.save()
        // .then(item => {
        // res.send("item saved to database");
        // })
        // .catch(err => {
        // res.status(400).send("unable to save to database");
        // });
       
        // var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(req.body), '2s5v8y/B').toString();

        // console.log("ciphertext",encodeURIComponent(ciphertext));

        const requested_data = req.query.data;

        var bytes  = CryptoJS.AES.decrypt(decodeURIComponent(requested_data), '2s5v8y/B');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        var myData = new webhookModel({"description":JSON.stringify(decryptedData)});
        myData.save()
        .then(item => {
        res.send("item saved to database");
        })
        .catch(err => {
        res.status(400).send("unable to save to database");
        });
    }
    catch(err)
    {
        console.log("err",err)
        res.status(400).send("unable to save to database");
    }
})

app.use(function(err,req,res,next){
    //console.log(err);
    res.status(422).send({error: err.message});
});

module.exports = app;