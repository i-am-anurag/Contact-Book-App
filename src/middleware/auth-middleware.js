const jwt = require('jsonwebtoken');
const { clientErrorCodes } = require("../utils/status-code");
const { JWT_SECERET_KEY } = require('../config/server-config');
const ip_banned_model = require('../model/ip-banned');
const User = require('../model/user');

const requestValidator = async(req,res,next)=>{
    try {
        const token = req.header('Authorization');
        if(!token){
            throw{
                statusCode:clientErrorCodes['FORBIDDEN'],
                message:'Token is missing',
            }
        }
        const verifyToken = jwt.verify(token,JWT_SECERET_KEY);
        if(!verifyToken){
            throw {
                statusCode:clientErrorCodes['FORBIDDEN'],
                message:error.message,
            }
        }
        const user = await User.find({_id:verifyToken._id});
        if(!user){
            throw {
                statusCode:clientErrorCodes['NOT_FOUND'],
                message:'User Not Found',
            }
        }
        req.user = verifyToken._id;
        next();
    } catch (error) {
        if(error.name == 'TokenExpiredError'){
            error.statusCode = clientErrorCodes['FORBIDDEN'];
            error.message = "Token expired"
        }
        if(error.name == 'JsonWebTokenError'){
            error.statusCode = clientErrorCodes['FORBIDDEN'];
            error.message = "Invalid Token"
        }
        console.error("Error message====>",error.name)
        return res.status(error.statusCode).json({
            flag:0,
            message:error.message,
        });
    }
}
const isIpbanned = async(req, res,next) => {
    try {
        // const requestIp = req.ip;
        // console.log("Ip: " + requestIp);
        let requestIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ipv4Regex = /::ffff:(\d+\.\d+\.\d+\.\d+)/;
        let match = requestIp.match(ipv4Regex);
        // match = match[1];
        const ipToCheck = match ? match[1] : requestIp;
        console.log("ipToCheck: " + ipToCheck);
        const isIpbanned = await ip_banned_model.findOne({
            ip_address: ipToCheck,
        });

        if(isIpbanned) {
            res.render('ip-ban');
        }
        next();
    } catch (error) {
        console.error("Error while processing Ip: " + error.message);
    }
}

module.exports = {
    requestValidator,
    isIpbanned,
}