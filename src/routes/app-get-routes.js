const {Router} = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login',(req, res) => {
    console.log("user get routes");
    res.render('auth/login');
});

router.get('/signup',(req, res) => {
    res.render('auth/signup');
});

router.get('/forgot-password',(req, res) => {
    res.render('auth/forgot-password');
});

router.get('/dashboard',(req, res) => {
    res.render('auth/dashboard');
});

router.get('/group',(req, res) => {
    res.render('auth/group');
});

router.get('/logout',(req, res) => {
    res.render('/');
});

// router.get('/contacts',(req, res) => {
//     res.render('auth/dashboard');
// })

module.exports = router;