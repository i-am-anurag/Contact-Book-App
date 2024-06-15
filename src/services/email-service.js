const sender = require('../config/email-config');
const { EMAIL_ID } = require('../config/server-config');
const { serverErrorCodes } = require('../utils/status-code');

class EmailService{
    constructor(){}

    async sendMail(data){
        try {
            const options = {
                from: EMAIL_ID,
                to: data.email,
                subject: data.subject,
                text: data.text,
            }

            const response = await sender.sendMail(options);

            return response;
        } catch (error) {
            throw{
                statusCode: serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message: error.message,
            }
        }
    }
}

module.exports = EmailService;