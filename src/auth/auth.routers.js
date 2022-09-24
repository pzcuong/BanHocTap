const express = require('express');
var pug = require('pug');

const router = express.Router();

const authController = require('./auth.controller');
const middleware = require('./auth.middlewares');

router.route('/register', )
    .post(authController.register)
    .get(middleware.isLogined, (req, res) => {
        let html = pug.renderFile('public/auth/Register.pug');
        res.send(html);
    });

router.route('/login')
    .post(authController.login)
    .get(middleware.isLogined, (req, res) => {
        let html = pug.renderFile('public/auth/Login.pug');
        res.send(html);
    });

router.get('/abc', (req,res) => {
    let html = pug.renderFile('public/auth/changePassword.pug');
    res.send(html);
})

router.get('/abc1', (req,res) => {
    let html = pug.renderFile('public/changePassword.pug');
    res.send(html);
})

router.post('/refresh', authController.refreshToken);

module.exports = router;