const UserService = require('../services/user-service');
const { SucessCodes,clientErrorCodes } = require('../utils/status-code');
const { isFieldEmpty, checkRequiredFields } = require('../utils/utils');
const ObjectId = require('mongoose').Types.ObjectId;

const userService = new UserService();

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
  

module.exports = {
    async signUp(req,res){
        try {
            const requestData = {...req.body};
            const {username,email,password} = requestData;
            checkRequiredFields(['username','email','password'],requestData);

            if(isFieldEmpty(username) || isFieldEmpty(email) || isFieldEmpty(password)){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'username, email and password should not be empty'
                }
            }

            if(!validateEmail(requestData['email'])){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Please enter valid email'
                }
            }
            if(!validatePassword(requestData['password'])){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Password must be at least one uppercase letter, lowercase letters and length should be minimum 8 characters'
                }
            }
            const response = await userService.createUser(requestData);

            return res.status(SucessCodes['CREATED']).json({
                flag:1,
                message:"User SignUp Sucessfully",
                data:response,
            });
        } catch (error) {
            console.log(error);
            return res.status(error.statusCode).json({
                falg:0,
                message:error.message,
            });
        }
    },

    async signIn(req,res){
        try {
            const requestData = {...req.body};
            const {email,password} = requestData;
            checkRequiredFields(['email','password'],requestData);
            
            if(!email || !password){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Missing required fields',
                }
            }

            if(!validateEmail(requestData["email"])){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Invalid credentials',
                }
            }
            const response = await userService.signIn(requestData);

            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"User logged In Sucessfully",
                token:response,
            });
        } catch (error) {
            console.log(error);
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async userInfo(req,res){
        try {
            const userId = req.user;
            if(!userId ||!ObjectId.isValid(userId)){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Invalid User Id",
                }
            }
            const user = await userService.userInfo(userId);

            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Successfully fetched userinfo",
                data:user,
            });
        } catch (error) {
            console.log(error);
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async updateUserInfo(req, res){
        try {
            const userId = req.user;
            const userData = {...req.body};
            const user = await userService.updateUserInfo(userId,userData);
            
            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Successfully fetched userinfo",
                data:user, 
            })
        } catch (error) {
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async forgotPassword(req,res){
        try {
            const {userEmail:email} = req.body;
            checkRequiredFields(['userEmail'],req.body);
            if(!validateEmail(email)){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Invalid Email",
                }
            }
            const mailRes = await userService.forgotPassword(email);
            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Password reset link sent successfully",
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async resetPassword(req,res){
        try {
            const {token} = req.query;
            console.log("Token is:",token);
            const userData = req.body;
            checkRequiredFields(['token','password','confirmPassword'],{...req.query,...req.body});
            const user = await userService.resetPassword(token,userData);0

            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Password reset successfully",       
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    }
}