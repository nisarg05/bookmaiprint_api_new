const mongoose = require("mongoose");

exports.connect = () => {
    // Connecting to the database
    // mongoose.connect('mongodb+srv://vista_print:oojl3rmofdbgv9l2@sunnyfamilytree.gtmba41.mongodb.net/vista_print').then(() => {
    mongoose.connect('mongodb://127.0.0.1:27017/vista_print').then(() => {
        console.log("Successfully connected to database");
    }).catch((error) => {
        console.log("database connection failed. exiting now...");
        console.error(error);
        process.exit(1);
    });
};
