const ContactModel = require('../model/contact');
const UserModel = require('../model/user');
const CrudRepository = require('./crud-repo');

class UserRepository extends CrudRepository {
    constructor(){
        super(UserModel);
    }
};

module.exports = UserRepository;