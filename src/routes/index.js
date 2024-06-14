const express = require('express');
const userRoutes = require('./user');
const contactRoutes = require('./contact');
const groupRoutes = require('./group');

const router = express.Router();

router.use('/user',userRoutes);
router.use('/contact',contactRoutes);
router.use('/group',groupRoutes);

module.exports = router;