const express = require('express');
const path = require('path');
const { signUp, signIn, userInfo, updateUserInfo } = require('../controller/user-controller');
const {requestValidator} = require('../middleware/auth-middleware');
// require('../../views/auth/login.ejs')

const router = express.Router();

router.post('/signup',signUp);
router.post('/signin',signIn);
router.get('/profile',requestValidator,userInfo);
router.patch('/update',requestValidator,updateUserInfo);

module.exports = router;