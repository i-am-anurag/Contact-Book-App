const {ContactRepository} = require('../repository');
const contactRepo = new ContactRepository();
const { clientErrorCodes } = require('../utils/status-code');

const authorizeContactAccess = async(req, res, next) => {
    try {
        const contactId = req.body.contactId; // Extract contact ID from request params
        const contact = await contactRepo.find({ _id: contactId})
        if(!contact) {
            throw {
                statusCode: clientErrorCodes['NOT_FOUND'],
                message: 'Contact not found',
            }
        }
        console.log("Contact comparision result: " + contact.createdBy.equals(req.user));
        if(!contact.createdBy.equals(req.user)){
            throw {
                statusCode: clientErrorCodes['UNAUTHORIZED'],
                message : 'You cannot edit OR delete this contact',
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
    authorizeContactAccess,
}