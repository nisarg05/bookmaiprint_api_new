const jwt = require("jsonwebtoken");
const message = require('../config/message');

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    try {
        if(token != undefined)
        {
            const decoded = jwt.verify(token, message.messages.JWT_STRING);
            req.user = decoded;
        }
        else
        {
            req.user = null;
        }
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};
  
module.exports = verifyToken;