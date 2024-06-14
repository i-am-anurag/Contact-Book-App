const ContactModel = require('../model/contact');
const { serverErrorCodes } = require('../utils/status-code');
const CrudRepository = require('./crud-repo');

class ContactRepository extends CrudRepository{
    constructor(){
        super(ContactModel);
    }

    async findContacts(filterData){
        try {
            const {skip,limit,...filter} = filterData;
            const totalRecords = await ContactModel.countDocuments(filter);
            const result = await ContactModel.find(filter)
            .populate({path:'groupId'})
            // .where({user_active:0})
            .skip(skip)
            .limit(limit);
            result.totalRecords = totalRecords;
            return result;
        } catch (error) {
             console.log("The Value of server error code is:",error);
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }
};

module.exports = ContactRepository;