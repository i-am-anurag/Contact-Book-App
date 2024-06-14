const {GroupRepository} = require('../repository/index');
const { clientErrorCodes } = require('../utils/status-code');
const Contact = require('../model/contact');

class GroupService{
    constructor(){
        this._groupRepository = new GroupRepository();
    }

    async createGroup(groupName,userId){
        try {
            const group = await this._groupRepository.find({name:groupName, createdBy:userId});
            if(group){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Group Already Exist',
                }
            }
            const response = await this._groupRepository.create({name:groupName, createdBy:userId});
            return response;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async updateGroup(userId,groupId,groupName){
        try {
            console.log('Updating Group Values:',userId,groupId,groupName);
            const groupExist = await this._groupRepository.find({name:groupName, createdBy:userId});
            if(groupExist){
                throw {
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:'Group Already Exist',
                }
            }
            const group = await this._groupRepository.update({_id:groupId}, {name:groupName});
            if(!group){
                throw {
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'Group not found',
                }
            }
            return group;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async deleteGroup(groupId){
        try {
            const group = await this._groupRepository.delete({_id:groupId});
            console.log("Group", group);
            if(!group){
                throw {
                    statusCode:clientErrorCodes['NOT_FOUND'],
                    message:'Group not found',
                }
            }
            await Contact.deleteMany({groupId});
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async findGroup(groupFilter,paginateData){
        try {
            const groups = await this._groupRepository.findAll(groupFilter,paginateData);
            return groups;
        } catch (error) {
            throw {
                statusCode:error.statusCode || serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }
};

module.exports = GroupService;