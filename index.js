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
const spreadsheetsModels = require('./src/spreadsheets/spreadsheets.models');

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

// app.use('/auth', authRoute);
// app.use('/user', userRoute);
// app.use('/admin', adminRoute);

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

app.post('/dangky/:vitri', async (req, res) => {
    try {
        let vitri = req.params.vitri;
        let data = req.body;
        let spreadsheetId = "1GgsKb5WksC1SOLcbq5V-PmEJVHw22asw7mSOf6ufGd8";
        if(vitri != 'Training' && vitri != 'TruyenThong' && vitri != 'Khac')
            res.redirect('/');
        let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "A:F");
        for (value in dataSheets) {
            if(dataSheets[value].at(0) == data.email) 
                return res.json({
                    status: 400,
                    message: "Email đã tồn tại"
                });
            if(dataSheets[value].at(2) == data.mssv) 
                return res.json({
                    status: 400,
                    message: "Mã số sinh viên đã tồn tại"
                });
        }
        console.log(data);
    
        if(!data.name || !data.email || !data.mssv || !data.LopSV || !data.FacebookURL || !data.LyDoThamGia || !data.TinhCachMuonLamViec || !data.TinhCachKhongMuonLamViec || !data.TinhHuong || !data.CauHoi2)
            return res.json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin"
            });
    
        //Insert to Tổng quan
        spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Tổng quan'!A:F", [[
            data.email,
            data.name,
            data.mssv,
            data.LopSV,
            req.params.vitri,
            data.FacebookURL
        ]]);
        //Insert to Training
        let dataInsert = [[
            data.mssv,
            data.LyDoThamGia,
            data.TinhCachMuonLamViec,
            data.TinhCachKhongMuonLamViec,
            data.TinhHuong,
            data.TinhHuongTraining
        ]];
        if(req.params.vitri == 'Training') {
            await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Training'!A:F", dataInsert);
        } else if(req.params.vitri == 'TruyenThong') {
            await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Truyền thông'!A:F", dataInsert);
        } else if(req.params.vitri == 'Khac') {
            await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Khác'!A:F", dataInsert);
        } else {
            return res.json({
                success: false,
                message: "Vị trí không hợp lệ"
            });
        }
        return res.json({
            success: true,
            message: "Đăng ký thành công"
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Đăng ký thất bại"
        });
    }
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

