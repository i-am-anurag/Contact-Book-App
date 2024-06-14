const {serverErrorCodes} = require('../utils/status-code')

class CrudRepository{
    constructor(model){
        this.model = model;
    }

    async create(data){
        try {
            const result = await this.model.create(data);

            return result;
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async find(filter){
        try {
            const result = await this.model.findOne(filter);

            return result;
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async findAll(filter,paginateData){
        try {
            const totalRecords = await this.model.countDocuments(filter);
            const result = await this.model.find(filter)
            .skip(paginateData.skip)
            .limit(paginateData.limit)
            .lean();

            result.totalRecords = totalRecords;

            return result;
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async update(filter,data){
        try {
            const result = await this.model.findByIdAndUpdate(filter,data,{ new: true, runValidators: true, });
            
            return result;
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }

    async delete(filter){
        try {
            const result = await this.model.findByIdAndDelete(filter);

            return result;
        } catch (error) {
            throw {
                statusCode:serverErrorCodes['INTERNAL_SERVER_ERROR'],
                message:error.message,
            }
        }
    }
};

module.exports = CrudRepository;