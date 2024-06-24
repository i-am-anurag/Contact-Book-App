const mongoose = require("mongoose");
const { getSchemaByName } = require("../schema");
const { debug_log } = require("../utils/lib/log.lib");
const { success_res } = require("../utils/lib/general.lib");


class CRUDModel {
    constructor(modelName, schema) {
        if (new.target === CRUDModel) {
            console.log("cannot create object from CRUDModel");
        }
        this.schema = getSchemaByName(schema);
        this.model = new mongoose.model(modelName, this.schema, modelName);
    }

    async createOne(data) {
        try {
            const result = await this.model.create(data);

            return result;
        } catch (error) {
            console.log(`Something went wrong in data insertion with error: ${error}`, 'error');
            return null;
        }
    }

    async findOne(filter, populatePath = [], selectedFields = null,sort = { created_at: -1 }) {
        try {
            let options = { readPreference: 'secondaryPreferred', sort};
            let populateOptions = (Array.isArray(populatePath) && populatePath.length > 0) ? populatePath.map(path => ({ path })) : [];

            if (populateOptions.length > 0) {
                options.populate = populateOptions;
            }


            const result = await this.model.findOne(filter, selectedFields, options);

            return result;
        } catch (error) {
            console.log(`Something went wrong in findOne method with error: ${error}`, 'error');
            throw error;
        }
    }

    async find(filter, populatePath = [], sort = { created_at: -1 }, selectedFields = null) {
        try {
            let options = { readPreference: 'secondaryPreferred' };
            let populateOptions = (Array.isArray(populatePath) && populatePath.length > 0) ? populatePath.map(path => ({ path, strictPopulate: false })) : [];

            if (populateOptions.length > 0) {
                options.populate = populateOptions;
            }

            const result = await this.model.find(filter, selectedFields, options).sort(sort);
            return result;
        } catch (error) {
            console.log(`Something went wrong in findAll method with error: ${error}`, 'error');
            throw error;
        }
    }
    
    async count(filter={}) {
        try {
            
            return await this.model.countDocuments(filter, null,{readPreference:"secondaryPreferred"});
        } catch (error) {
            console.log(`Something went wrong in count method with error: ${error}`, 'error');
            throw error;
        }
    }
    
    async aggregate(filter={},group={}) {
        try {
            return this.model.aggregate([
                {
                    $match: filter
                },
                {
                    $group: group
                }
            ], { readPreference: 'secondaryPreferred' })
            // return await this.model.countDocuments(filter, null,{readPreference:"secondaryPreferred"});
        } catch (error) {
            console.log(`Something went wrong in count method with error: ${error}`, 'error');
            throw error;
        }
    }

    async paginateData(filterData, populateFields = {}, sort = { created_at: -1 }, selectedFields = null) {
        try {
            const { skip, itemPerPage, ...filter } = filterData;
            let options = { readPreference: 'secondaryPreferred' };
            let populateOptions = [];
            if (Object.keys(populateFields).length > 0) {
                populateOptions = Object.entries(populateFields).map(([path, fields]) => {
                    return { path, select: fields };
                });
            }

            if (populateOptions.length > 0) {
                options.populate = populateOptions;
            }
            const totalRecords = await this.model.countDocuments(filter);
            const result = await this.model.find(filter, selectedFields, options)
                .sort(sort)
                .skip(skip)
                .limit(itemPerPage)
            result.totalRecords = totalRecords;
            return result;
        } catch (error) {
            console.log(`Something went wrong in paginateData method with error: ${error}`, 'error');
            throw error;
        }
    }
    async findById(filter) {
        try {
            const result = await this.model.findById(filter);
            return result;
        } catch (error) {
            console.log(`Something went wrong in updateOne method with error: ${error}`, 'error');
            throw error;
        }
    }
    async findAll() {
        try {
            const result = await this.model.find()
            return result;
        } catch (error) {
            console.log(`Something went wrong in updateOne method with error: ${error}`, 'error');
            throw error;
        }
    }
    async updateOne(filter, data) {
        try {
            console.log("filter",filter);
            console.log("data",data);
            const result = await this.model.findOneAndUpdate(filter, data, { new: true, runValidators: true });

            return result;
        } catch (error) {
            console.log(`Something went wrong in updateOne method with error: ${error}`, 'error');
            throw error;
        }
    }
    async updateMany(filter, data) {
        try {
            const result = await this.model.updateMany(filter, data, { runValidators: true });

            return result;
        } catch (error) {
            console.log(`Something went wrong in updateMany method with error: ${error}`, 'error');
            throw error;
        }
    }

    async delete(filter) {
        try {
            const result = await this.model.deleteOne(filter);
        } catch (error) {
            console.log(`Something went wrong in delete method with error: ${error}`, 'error');
            throw error;
        }
    }

    async deleteMany(filter) {
        try {
            const deletedDocs = await this.model.deleteMany(filter);
            console.log("Total Deleted deletedDocs are:::::::::::::::", deletedDocs.deletedCount);
            return success_res("Data deleted successfully",deletedDocs.deletedCount);
        } catch (error) {
            console.log(`Something went wrong in deleteMany method with error: ${error}`, 'error');
            throw error;
        }
    }

    toObject(data) {
        try{
            if(Array.isArray(data)){
                debug_log('Data is array'); 
                return data.map(item => item.toObject());
            }else{
                return data.toObject();
            }
        }catch(error){
            console.log(`Something went wrong in toObject method with error: ${error}`, 'error');
            throw data;
        }
    }

    async findAllData(filterData, populateFields = {}, sort = { created_at: -1 }, selectedFields = null) {
        try {
            const { skip, itemPerPage, ...filter } = filterData;
            let lookupStages = [];
            // if (Object.keys(populateFields).length > 0) {
            //     lookupStages = Object.entries(populateFields).flatMap(([path, fields]) => {
            //         return [
            //             {
            //                 $addFields: {
            //                     [`${fields.localfield}_ObjectId`]: { $toObjectId: fields.localfield }
            //                 }
            //             },
            //             {
            //                 $lookup: {
            //                     from: path, // the name of the other collection
            //                     localField: `${fields.localfield}_ObjectId`, // the field in this collection
            //                     foreignField: '_id', // the field in the other collection
            //                     as: path // the name of the new array field to add to the input documents
            //                 }
            //             },
            //             // {
            //             //     $project: { [path]: { $arrayElemAt: [`$${path}`, 0] } } // to flatten the array
            //             // }
            //         ];
            //     });
            // }

            if (Object.keys(populateFields).length > 0) {
                lookupStages = Object.entries(populateFields).flatMap(([path, fields]) => {
                    return [
                        {
                            $lookup: {
                                from: path, // the name of the other collection
                                let: { local_id: "$" + fields.localfield }, // define local_id variable
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: [{ $toString: "$_id" }, "$$local_id"] // compare _id and local_id
                                            }
                                        }
                                    }
                                ],
                                as: path // the name of the new array field to add to the input documents
                            }
                        },
                        // {
                        //     $project: { [path]: { $arrayElemAt: [`$${path}`, 0] } } // to flatten the array
                        // }
                    ];
                });
            }

            // const pipeline = [
            //     { $match: filter },
            //     ...lookupStages,
            //     { $sort: sort },
            //     { $skip: skip },
            //     { $limit: itemPerPage },
            //     ...(selectedFields ? [{ $project: selectedFields }] : [])
            // ];

            const pipeline = [
                { $match: filter },
                ...lookupStages,
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [
                            { $sort: sort },
                            { $skip: skip },
                            { $limit: itemPerPage },
                            ...(selectedFields ? [{ $project: selectedFields }] : [])
                        ]
                    }
                },
                { $unwind: "$metadata" },
                {
                    $project: {
                        total: "$metadata.total",
                        data: "$data"
                    }
                }
            ];
    
            console.log("pipeline", pipeline);
    
            const result = await this.model.aggregate(pipeline).read("secondary").exec();

            console.log("result", result[0].total);
            // return result;
    
            return result.length > 0 ? { total: result[0].total, data: result[0].data } : { total: 0, data: [] };

        } catch (error) {
            console.log(`Something went wrong in aggregateData method with error: ${error}`, 'error');
            throw error;
        }
    }
    
};

module.exports = CRUDModel