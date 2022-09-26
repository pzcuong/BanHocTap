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
const emailController = require('./src/email/email.controller');
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
        
        let check = await XuLyDuLieu(data);
        if(!check.success)
            return res.json({
                status: 400,
                message: check.message
            });

        let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "A:G");
        
        for (value in dataSheets) {
            if(dataSheets[value].at(1) == data.email) 
                return res.json({
                    status: 400,
                    message: "Email đã tồn tại"
                });
            if(dataSheets[value].at(3) == data.mssv) 
                return res.json({
                    status: 400,
                    message: "Mã số sinh viên đã tồn tại"
                });
        }
        console.log(data);
        //Get time now
        let date = new Date();
        let time = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours()+7 + ":" + date.getMinutes() + ":" + date.getSeconds();
    
        //Insert to Tổng quan
        await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Tổng quan'!A:G", [[
            time,
            data.email,
            data.name,
            data.mssv,
            data.LopSV,
            req.params.vitri,
            data.FacebookURL
        ]]);
        let dataInsert = [[
            data.mssv,
            data.LyDoThamGia,
            data.TinhCachMuonLamViec,
            data.TinhCachKhongMuonLamViec,
            data.TinhHuong,
            data.CauHoi2
        ]];
        if(req.params.vitri == 'Training') {
            await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Training'!A:F", dataInsert);
        } else if(req.params.vitri == 'TruyenThong') {
            req.params.vitri = 'Truyền thông';
            await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Truyền thông'!A:F", dataInsert);
        } else if(req.params.vitri == 'Khac') {
            req.params.vitri = 'Khác';
            await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Khác'!A:F", dataInsert);
        } else {
            return res.json({
                success: false,
                message: "Vị trí không hợp lệ"
            });
        }
        let result = await emailController.GuiMailDangKyPV(data.email, "Thông báo kết quả tham gia sơ tuyển vào Ban Học Tập", req.params.vitri, data.name);
        console.log(result);
        return res.json({
            success: true,
            message: "Đăng ký thành công! Vui lòng kiểm tra email để biết kết quả",
            redirect: "/"
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Đăng ký thất bại"
        });
    }
});

app.get('/testmail', (req, res) => {
    let html = pug.renderFile('public/email/index.pug', {position: "position"});
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

async function XuLyDuLieu(data) {
    let check = true;
    let loi;
    if(!data.name || data.name.length < 5)
        check = false,
        loi = "Tên không hợp lệ";
    if(!data.email || !data.email.includes('@') || !data.email.includes('.'))
        check = false,
        loi = "Email không hợp lệ";
    if(!data.mssv || data.mssv.length != 8)
        check = false,
        loi = "Mã số sinh viên không hợp lệ";
    if(!data.LopSV)
        check = false,
        loi = "Lớp sinh viên không hợp lệ";
    if(!data.FacebookURL || !data.FacebookURL.includes('.com'))
        check = false,
        loi = "Facebook URL không hợp lệ";
    if(!data.LyDoThamGia || data.LyDoThamGia.length < 5)   
        check = false,
        loi = "Lý do tham gia không hợp lệ";
    if(!data.TinhCachMuonLamViec || data.TinhCachMuonLamViec.length < 5)
        check = false,
        loi = "Tính cách muốn làm việc không hợp lệ";
    if(!data.TinhCachKhongMuonLamViec || data.TinhCachKhongMuonLamViec.length < 5)
        check = false,
        loi = "Tính cách không muốn làm việc không hợp lệ";
    if(!data.TinhHuong || data.TinhHuong.length < 5) 
        check = false,
        loi = "Tình huống không hợp lệ";
    if(!data.CauHoi2 || data.CauHoi2.length < 5)
        check = false,
        loi = "Câu hỏi 2 không hợp lệ";
    if(!check)
        return ({
            success: false,
            message: loi
        })
    return ({
        success: true,
        message: "Dữ liệu hợp lệ"
    })
}
