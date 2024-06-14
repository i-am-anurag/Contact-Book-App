const mongoose = require('mongoose');
const Contact = require('./contact');

const groupSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Group name is required"],
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required: true,
    },
},{timestamps:true});

// groupSchema.pre('deleteOne', async function(next){
//     try {
//         const contact = await Contact.deleteMany({groupId:this._id});

//         next();
//     } catch (error) {
//         next(error);
//     }
// })

const Group = mongoose.model('Group',groupSchema,'Group');

module.exports = Group;