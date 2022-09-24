const express = require('express');
var pug = require('pug');

const router = express.Router();

const authMiddleware = require('../auth/auth.middlewares');
const authController = require('../auth/auth.controller');
const userController = require('./users.controller');

const isAuth = authMiddleware.isAuth;

router.get('/profile', isAuth, async (req, res) => {
	console.log(req.user);
	let html = pug.renderFile('public/user/profile.pug', {
		user: req.user.result,
		image: req.image,
	});
	res.send(html);
});

router.route('/DoiMatKhau')
	.get(isAuth, async (req, res) => {
		let html = pug.renderFile('public/changePassword.pug');
		res.send(html);
	})
	.post(isAuth, authController.DoiMatKhau);

router.get('/TestSQL', isAuth, userController.LayDanhSachCauHoi); 

router.get('/BaiTap', isAuth, userController.LayDanhSachBaiTap); 

router.route('/BaiTap/:MaBT/:MaCH')
	.get(isAuth, userController.LayNoiDungBaiTap)
	.post(isAuth, userController.NopBaiTap);

router.get('/LichSu', isAuth, userController.LayLichSuTruyVan);

router.route('/TestSQL/:MaCH')
	.get(isAuth, userController.LayCauHoi)
	.post(isAuth, userController.TestSQL);

module.exports = router;

