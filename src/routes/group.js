const express = require('express');
const { createGroup, updateGroup, deleteGroup, findGroups } = require('../controller/group-controller');
const { requestValidator } = require('../middleware/auth-middleware');
const { authorizeGroupAccess } = require('../middleware/group-middleware');

const router = express.Router();

router.post('/create',requestValidator,createGroup);
router.patch('/update/:groupId',requestValidator,authorizeGroupAccess,updateGroup);
router.delete('/',requestValidator,authorizeGroupAccess,deleteGroup);
router.post('/',requestValidator,findGroups);

module.exports = router;
