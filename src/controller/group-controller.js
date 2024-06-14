const GroupService = require("../services/group-service");
const { SucessCodes,clientErrorCodes } = require("../utils/status-code");
const { isFieldEmpty } = require("../utils/utils");
const ObjectId = require('mongoose').Types.ObjectId;

const groupService = new GroupService();

module.exports = {
    async createGroup(req,res){
        try {
            const {group_name} = {...req.body};
            const userId = req.user;
            if((!group_name)){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Group name should not be empty",
                }
            }
            if(isFieldEmpty(group_name)) {
                throw {
                  statusCode: clientErrorCodes['BAD_REQUEST'],
                  message: "Group name should not be empty",
                };
            }
            const response = await groupService.createGroup(group_name,userId);

            return res.status(SucessCodes['CREATED']).json({
                flag:1,
                message:"Group created sucessfully",
                data:response,
            });
        } catch (error) {
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async findGroups(req,res){
        try {
            // const {group_name,date,page = 1,limit = 10} = {...req.body};
            const [filterValuesString] = Object.keys(req.body); // Extract the only key as a string
            const filterValues = JSON.parse(filterValuesString);
            const { group_name, date, page = 1, limit = 20} = filterValues;
            const skip = (page-1)*limit;
            let filter = {
                createdBy:req.user
            }
            let paginateData = {
                skip,
                limit,
            }            
            if(req.body.groupId){
                filter._id = req.params.groupId;
            }
            if(group_name){
                filter.name = {$regex: `${group_name}`, $options: 'i'};
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
            const response = await groupService.findGroup(filter,paginateData);
            const totalPages = Math.ceil(response.totalRecords / limit);

            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Successfully fetched all Groups",
                data:response,
                totalPages:totalPages,
            });
        } catch (error) {
            console.log(error);
            return res.status(error.statusCode).json({
                flag:0,
                message:error.message,
            });
        }
    },

    async updateGroup(req,res){
        try {
            const {groupId,...groupData} = {...req.body};
            const {group_name} = groupData;
            const userId = req.user;
            if(!group_name){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"group name should not be empty",
                }
            }
            if(isFieldEmpty(group_name)){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"group name should not be empty",
                }
            }
            if(!groupId && !ObjectId.isValid(groupId)){
                throw{
                    statusCode:clientErrorCodes['BAD_REQUEST'],
                    message:"Invalid group Id",
                }
            }
            const response = await groupService.updateGroup(userId,groupId,group_name);
            return res.status(SucessCodes['OK']).json({
                flag:1,
                message:"Group updated sucessfully",
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

    async deleteGroup(req,res){
      try {
        const groupId = req.body.groupId;
        if(!groupId || !ObjectId.isValid(groupId)){ 
            throw{
                statusCode:clientErrorCodes['BAD_REQUEST'],
                message:"Invalid Group Id",
            }
        }
        await groupService.deleteGroup(groupId);
        return res.status(SucessCodes['OK']).json({
            flag:1,
            message:"Group deleted sucessfully",
        });
      } catch (error) {
        return res.status(error.statusCode).json({
            flag:0,
            message:error.message,
        });
      }  
    }
}