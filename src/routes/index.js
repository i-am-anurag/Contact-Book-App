const express = require('express');
const userRoutes = require('./user');
const contactRoutes = require('./contact');
const groupRoutes = require('./group');
const { requestValidator } = require('../middleware/auth-middleware');
const { resetPassword } = require('../controller/user-controller');

const router = express.Router();

router.use('/user',userRoutes);
router.use('/contact',contactRoutes);
router.use('/group',groupRoutes);
router.post('/reset-password/',requestValidator,resetPassword); // reset password route

module.exports = router;