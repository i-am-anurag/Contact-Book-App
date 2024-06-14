const GroupModel = require('../model/group');
const CrudRepository = require('./crud-repo');

class GroupRepository extends CrudRepository {
    constructor(){
        super(GroupModel);
    }
};

module.exports = GroupRepository;