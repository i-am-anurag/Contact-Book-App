const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {UserRepository} = require('../repository');
const { clientErrorCodes, serverErrorCodes } = require('../utils/status-code');
const {JWT_SECERET_KEY, TOKEN_EXPIRY} = require('../config/server-config');

class UserService{
    constructor(){
        this._userRepository = new UserRepository();
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
};


module.exports = UserService;