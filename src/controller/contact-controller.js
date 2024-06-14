const ContactService = require("../services/contact-service");
const { SucessCodes,clientErrorCodes } = require("../utils/status-code");
const { isFieldEmpty, checkRequiredFields } = require("../utils/utils");
const ObjectId = require('mongoose').Types.ObjectId;

const contactService = new ContactService();

const validateContactNo = (contactNo)=>{
    const contactNoRegex = /^[+]?(\d{1,2})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

    return contactNoRegex.test(contactNo);
}

module.exports = {
    async createContact(req,res){
        try {
            const contactData = {...req.body};
            const {name,contactNo} = contactData;
            const {groupId} = {...req.query};
            const userId = req.user;
            checkRequiredFields(['name','contactNo'],contactData);
            if(isFieldEmpty(name) || isFieldEmpty(contactNo)) {
                throw {
                  statusCode: clientErrorCodes['BAD_REQUEST'],
                  message: "name and contact no should not be empty",
                };
            }
            if(!validateContactNo(contactNo)){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"invalid contact no",
                }
            }

            if(groupId && !ObjectId.isValid(groupId)){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Invalid group Id",
                }
            }
            contactData.createdBy = userId;

            const response = await contactService.createContact(contactData, groupId);

            return res.status(SucessCodes['CREATED']).json({
                flag:1,
                message:"Contact created sucessfully",
                data:response,
            });
        } catch (error) {
            console.log("The Value of server error code is:",error);
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async findContacts(req,res){
        try {
            const [filterValuesString] = Object.keys(req.body); // Extract the only key as a string
            const filterValues = JSON.parse(filterValuesString);
            const { name, date, contact_no, page = 1, limit = 20, groupId } = filterValues;
            const skip = (page-1)*limit;
            let filter = {
                createdBy:req.user,
                skip,
                limit,
            }
            if(req.body.contactId){
                filter._id = req.params.contactId;
            }
            if(name){
                filter.name = { $regex: `${name}`, $options: 'i' };
            }
            if(date){
                const dateToFind = new Date(date);
                if(isNaN(dateToFind.getTime())){
                    throw {
                        statusCode: clientErrorCodes['BAD_REQUEST'],
                        message: "Please enter a valid date",
                    }               
                }
                const startDate = new Date(dateToFind.getFullYear(), dateToFind.getMonth(), dateToFind.getDate(), 0, 0, 0, 0);
                const endDate = new Date(dateToFind.getFullYear(), dateToFind.getMonth(), dateToFind.getDate(), 23, 59, 59, 999);
                filter.createdAt = { $gte: startDate, $lte: endDate }; 
            }
            if(contact_no){
                filter.contactNo = {$regex: `${contact_no}`};
            }
            if(groupId){
                filter.groupId = groupId;
            }
            const contacts = await contactService.findContact(filter);
            const totalPages = Math.ceil(contacts.totalRecords / limit);

            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Successfully fetched all contacts",
                data: contacts,
                totalPages: totalPages,
            });
        } catch (error) {
            console.log(error);
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async updateContact(req,res){
        try {
            console.log("Update Function is called");
            const {contactId,...contactData} = {...req.body};
            const {name,contactNo} = contactData;
            const userId = req.user;
            if(!name && !contactNo){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"name and contact_no should not be empty",
                }
            }
            // if(isFieldEmpty(name) || isFieldEmpty(contact_no)){
            //     throw{
            //         statusCode:clientErrorCodes['BAD_REQUEST'],
            //         message:"name and contact_no should not be empty",
            //     }
            // }
            if(contactNo && !validateContactNo(contactNo))
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"invalid contact no",
                }
            if(!contactId && !ObjectId.isValid(contactId)){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Invalid Contact Id",
                }
            }
            const response = await contactService.updateContact(contactId,userId,contactData);
            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Contact updated sucessfully",
                data:response,
            });
        } catch (error) {
            console.error(error);
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async deleteContact(req,res){
      try {
        const contactId = req.body.contactId;
        if(!contactId || !ObjectId.isValid(contactId)){ 
            throw{
                statusCode:clientErrorCodes['BAD_REQUEST'],
                message:"Invalid Contact Id",
            }
        }
        await contactService.deleteContact(contactId);
        return res.status(SucessCodes['OK']).json({
            flag:1,
            message:"Contact deleted sucessfully",
        });
      } catch (error) {
        return res.status(error.statusCode).json({
            flag:0,
            message:error.message,
        });
      }  
    }
}