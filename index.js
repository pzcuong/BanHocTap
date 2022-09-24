var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');
var pug = require('pug');
var compression = require('compression');

const authRoute = require('./src/auth/auth.routers');
const userRoute = require('./src/users/users.routers');
const adminRoute = require('./src/admin/admin.routers');
const emailRoute = require('./src/email/email.controller');

require('dotenv').config();

var app = express();

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use('/public', express.static('./public'));

console.log(process.env.PORT);
var port = process.env.PORT || 8080;

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/admin', adminRoute);

app.get('/', (req, res) => {
    let html = pug.renderFile('public/GioiThieu.pug');
    res.send(html);
});

app.get('/dangky/:vitri', (req, res) => {
    let vitri = req.params.vitri;
    if(vitri != 'Training' && vitri != 'TruyenThong' && vitri != 'Khac')
        res.redirect('/');

    let html = pug.renderFile('public/XetTuyen.pug', {vitri: req.params.vitri});
    res.send(html);
});

app.use((req, res, next) => {
    let html = pug.renderFile('public/404.pug', {
        message: 'OOps! Page not found',
        href: 'Quay về trang chủ',
        redirect: '/'
    });
	res.send(html);
});

//set public folder as static folder for static files
app.use(express.static('/public'));

app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

