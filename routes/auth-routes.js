const router = require('express').Router();

//auth google
router.get('/profile', (req,res) => {
    res.render('profile');
});

//auth with google
router.get('/google',(req,res) => {
    res.send('logging in with google');
});

//auth logout
router.get('/logout', (req,res) => {
    res.render('logging out');
});

module.exports = router;