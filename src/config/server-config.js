const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const connect = async()=>{
    try {
        const connectionString = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
        await mongoose.connect(connectionString);
    } catch (error) {
        console.log("There is an error for mongoDB connection:",error);
        throw error;
    }
}


module.exports = {
    PORT:process.env.PORT,
    connect,
    SALT_ROUNDS,
    JWT_SECERET_KEY:process.env.JWT_SECERET_KEY,
    TOKEN_EXPIRY:process.env.TOKEN_EXPIRY,
    EMAIL_ID : process.env.EMAIL_ID,
    EMAIL_PASSWORD : process.env.EMAIL_PASSWORD,
}