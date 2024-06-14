const {GroupRepository} = require('../repository');
const groupRepo = new GroupRepository();
const { clientErrorCodes } = require('../utils/status-code');

const authorizeGroupAccess = async(req, res, next) => {
    try {
        const groupId = req.body.groupId; // Extract group ID from request params
        const group = await groupRepo.find({ _id: groupId})
        if(!group) {
            throw {
                statusCode: clientErrorCodes['NOT_FOUND'],
                message: 'group not found',
            }
        }
        if(!group.createdBy.equals(req.user)){
            throw {
                statusCode: clientErrorCodes['UNAUTHORIZED'],
                message : 'You cannot edit OR delete this group',
            }
        }
        next();
    } catch (error) {
        return res.status(error.statusCode).json({
            flag:0,
            message:error.message,
        });
    }
};


module.exports = {
    authorizeGroupAccess,
}