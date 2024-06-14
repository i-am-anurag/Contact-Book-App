const mongoose = require('mongoose');
const bcrypt =require('bcrypt');
const {SALT_ROUNDS} = require('../config/server-config')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"password is required"],
    },
    user_active:{
        type:Number,
        default:0,
    }
},{timestamps:true});

userSchema.pre('save',function(next){
    const user = this;
    const SALT = bcrypt.genSaltSync(SALT_ROUNDS);
    const encyptedPassword = bcrypt.hashSync(user.password,SALT);
    user.password = encyptedPassword;

    next();
});

userSchema.methods.toJSON = function(){
    const userObject = this.toObject();
    delete userObject.__v;
    delete userObject.updatedAt;
    
    return userObject;
}

const User = mongoose.model('User',userSchema,'User');

module.exports = User;