const multer = require('multer');
const fs = require("fs");
// SET STORAGE
var limits = {
    files: 10, // allow only 1 file per request
    //fileSize: 100 * 1024
};

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var file_name = file.originalname;
        file_name=file_name.replace( / +/g, "_");
        cb(null, Date.now()+'-'+file_name);
    },
    limits: { fileSize: limits }
})

exports.oneUpload = multer({
    storage: storage,
});

var storageTemp = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'temp/')
    },
    filename: function (req, file, cb) {
        console.log("file",file);
        var file_name = file.originalname;
        file_name=file_name.replace(" ","_");
        cb(null, Date.now()+'-'+file_name);
    },
    limits: { fileSize: limits }
})

exports.oneUploadTemp = multer({
    storage: storageTemp,
});

var storageUploadTemp = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        var file_name = file.originalname;
        console.log("file_name","file_name1"+file_name);
        file_name=file_name.replace( / +/g, "_");
        console.log("file_name","file_name2"+file_name);
        cb(null, Date.now()+'-'+file_name);
    },
    limits: { fileSize: limits }
})

exports.uploadTemp = multer({
    storage: storageUploadTemp,
});

var multipleStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'temp/')
    },
    filename: function (req, file, cb) {
        var file_name = file.originalname;
        console.log("file_name","file_name1"+file_name);
        file_name=file_name.replace( / +/g, "_");
        console.log("file_name","file_name2"+file_name);
        cb(null, Date.now()+'-'+file_name);
    },
    limits: { fileSize: limits }
})

exports.multipleUpload = multer({
    storage: multipleStorage,
});