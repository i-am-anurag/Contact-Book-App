const { ContactRepository,GroupRepository } = require("../repository");
const { clientErrorCodes,serverErrorCodes } = require("../utils/status-code");

class ContactService{
    constructor(){
        this.contactRepository = new ContactRepository();
        this.groupRepository = new GroupRepository();
    }
    async createContact(contactData,groupId = null) {
        try {
            const {name,contactNo,createdBy} = contactData;
            const contactExist = await this.contactRepository.find({
                createdBy,
                $or: [
                    { name },
                    { contactNo }
                ]
            });

            console.log("contactExist value:",contactExist);
            // console.log("Group ID value:",groupId);
            if(contactExist){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Contact Already Exist',
                }
            }
            if(groupId){
                contactData.groupId = groupId;
            }
            const contact = await this.contactRepository.create(contactData);
            return contact;
        } catch (error) {
            console.log(error);
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async findContact(filter){
        try {
            const contact = await this.contactRepository.findContacts(filter);
            // if(contact.length===0){
            //     throw {
            //         statusCode:clientErrorCodes['NOT_FOUND'],
            //         message:'No contact found',
            //     }
            // }
            return contact;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async updateContact(contactId,createdBy,contactData){
        try {
            const {name,contactNo} = contactData;
            // console.log("Update API filtration API data",name,contactNo,userId);
            // const contactExist = await this.contactRepository.find({
            //     createdBy,
            //     $and: [
            //         { name },
            //         { contactNo }
            //     ]
            // });
            const contactExist = await this.contactRepository.find({
                createdBy,
                contactNo,
            });

            console.log("Contact Exist Value: ",contactExist);

            if(!contactExist._id.equals(contactId)){
                throw {
                    statusCode: clientErrorCodes['BAD_REQUEST'],
                    message: 'Contact Already Exist',
                }
            }


            // if(contactExist){
            //     throw {
            //         statusCode:clientErrorCodes['BAD_REQUEST'],
            //         message: 'Contact Already Exist',
            //     }
            // }
            const contact = await this.contactRepository.update({_id:contactId},contactData);
            if(!contact){
                throw{
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'Contact Not found',
                }
            }

            return contact;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async deleteContact(contactId){
        try {
            const contact = await this.contactRepository.delete({_id:contactId});
            if(!contact){
                throw{
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'Contact Not found',
                }
            }

            return contact;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }
};

module.exports = ContactService;