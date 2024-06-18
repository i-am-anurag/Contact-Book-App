const ChatModel = require('../model/chat');
const { serverErrorCodes } = require('../utils/status-code');
const CrudRepository = require('./crud-repo');

class ChatRepository extends CrudRepository{
    constructor(){
        super(ChatModel);
    }

    async findChat(filterData){
        try {
            const {skip,limit,...filter} = filterData;
            const totalRecords = await ChatModel.countDocuments(filter);
            const result = await ChatModel.find(filter)
            .populate({path:'sender',select:'name email'})
            .populate({path:'receiver',select:'name email'})
            .populate({path:'groupId'})
            .skip(skip)
            .limit(limit);
            result.totalRecords = totalRecords;
            return result;
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }
}

module.exports = ChatRepository;
