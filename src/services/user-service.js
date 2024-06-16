const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {UserRepository} = require('../repository');
const { clientErrorCodes, serverErrorCodes } = require('../utils/status-code');
const {JWT_SECERET_KEY, TOKEN_EXPIRY, SALT_ROUNDS} = require('../config/server-config');
const EmailService = require('./email-service');

class UserService{
    constructor(){
        this._userRepository = new UserRepository();
        this._emailService = new EmailService();
    }

    generateToken(userId,rememberMe){
        try {
            const options = rememberMe ? {} : { expiresIn: TOKEN_EXPIRY };
            return jwt.sign({_id:userId},JWT_SECERET_KEY,options);
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    decodeToken(token) {
        try {
            return jwt.verify(token, JWT_SECERET_KEY);
        } catch (error) {
            throw {
                statusCode: clientErrorCodes['UNAUTHORIZED'],
                message: error.message,
            }
        }
    }

    async createUser(userData){
        try {
            const {email} = userData;
            const userExist = await this._userRepository.find({email:email});
            // const userExist = await this._userRepository.find({email:email,contact:contact});

            if(userExist){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Email already registered",
                }
            }

            let user = await this._userRepository.create(userData);
            user = user.toObject();
            delete user["password"];

            return user;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async signIn(userData){
        try {
            const {email,password,rememberMe} = userData;
            const userExist = await this._userRepository.find({email:email});
            if(!userExist){
                throw {
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:"Invalid Credentials",
                }
            }
            const mathcedPassword = bcrypt.compareSync(password,userExist.password);
            if(!mathcedPassword){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Invalid Password",
                }
            }

            const token = this.generateToken(userExist._id,rememberMe);

            return token;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async userInfo(userId){
        try {
            const user = await this._userRepository.find({_id:userId});
            if(!user){
                throw {
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'User Not Found',
                }
            }
            delete user["password"];
            return user;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async updateUserInfo(userId,userData){
        try {
            const user = await this._userRepository.update({_id:userId},userData);
            if(!user){
                throw {
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'User Not Found',
                }
            }
            return user;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async forgotPassword(email){
        try {
            const user = await this._userRepository.find({email:email});
            if(!user){
                throw {
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'User Not Found',
                }
            }
            console.log("Found User is:",user);
            const token = this.generateToken(user._id,false);
            const resetLink = `${process.env.APP_URL}api/reset-password/?token=${token}`;
            const mailData = {
                subject: 'Password reset Token',
                email: email,
                text: `Please click on this link to reset your password: ${resetLink}`,
            }
            const mailSendRes = await this._emailService.sendMail(mailData);
            if(mailSendRes.error){
                throw {
                    statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                    message:'Failed to send mail',
                }
            }

            return mailSendRes;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async resetPassword(token,userData){
        try {
            const {password,confirmPassword} = userData;
            const decodeToken = this.decodeToken(token);
            if(!decodeToken){
                throw {
                    statusCode:clientErrorCodes['UNAUTHORIZED'],
                    message:'Invalid Token',
                }
            }
            const user = await this._userRepository.find({_id:decodeToken.id});
            if(!user){
                throw {
                    statusCode: clientErrorCodes['NOT_FOUND'],
                    message:'User Not Found',
                }
            }
            
            if(password !== confirmPassword){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Password and Confirm Password do not match',
                }
            }

            const SALT = bcrypt.genSaltSync(SALT_ROUNDS);
            const hashedPassword = bcrypt.hashSync(password, SALT);
            const updatedUser = await this._userRepository.update({_id:decodeToken.id},{password:hashedPassword});
            if(!updatedUser){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Failed to update password',
                }
            }
            
            return updatedUser;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        } 
    }
};


module.exports = UserService;