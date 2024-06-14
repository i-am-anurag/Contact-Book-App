const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required'],
    },
    contactNo:{
        type:String,
        required:[true,'contact number is required'],
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    groupId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null,
        ref:'Group',
    }
},{timestamps:true});

contactSchema.methods.toJSON = function(){
    const contactObject = this.toObject();
    delete contactObject.__v;
    delete contactObject.updatedAt;
    return contactObject;
}

const Contact = mongoose.model('Contact',contactSchema,'Contact');

module.exports = Contact;