const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    message:{
        type:String,
        required:[true,'message is required'],
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    groupId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
        ref:'Group',
    }
},{timestamps:true});

chatSchema.methods.toJSON = function(){
    const chatObject = this.toObject();
    delete chatObject.__v;
    return chatObject;
}

const Chat = mongoose.model('Chat',chatSchema,'Chat');