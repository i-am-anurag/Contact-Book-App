const express  = require('express');
const { createContact, updateContact, deleteContact, findContacts } = require("../controller/contact-controller");
const { requestValidator } = require("../middleware/auth-middleware");
const { authorizeContactAccess } = require('../middleware/contact-middlware');

const router = express.Router();

router.post('/create',requestValidator,createContact);
router.patch('/update',requestValidator,authorizeContactAccess,updateContact);
router.delete('/',requestValidator,authorizeContactAccess,deleteContact);
// router.get('/:contactId,',requestValidator,findContacts);
router.post('/',requestValidator,findContacts);

module.exports = router;