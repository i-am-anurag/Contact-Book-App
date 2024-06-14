const { clientErrorCodes } = require("./status-code");

const isFieldEmpty = (field)=>{
    if(field.trim()==""){
        return true;
    }
    return false;
}

function checkRequiredFields(fields, requestBody) {
    const missingFields = fields.filter(field => !requestBody[field]);
    if (missingFields.length > 0) {
        const missingFieldNames = missingFields.join(', ');
        throw {
            statusCode: clientErrorCodes['BAD_REQUEST'],
            message: `${missingFieldNames} is missing`
        };
    }
}

module.exports = {
    isFieldEmpty,
    checkRequiredFields,
}