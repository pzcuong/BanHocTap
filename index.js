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

app.get('/', async (req, res) => {
    //check if time in date 30/09/2022 08:00:00
    let spreadsheetId = "1GgsKb5WksC1SOLcbq5V-PmEJVHw22asw7mSOf6ufGd8";

    let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "'Thời gian'!A:F");
    var date = new Date();
    var date2 = new Date(dataSheets.at(1).at(0));
    date2.setHours(date2.getHours() - 7);
    date2 = new Date(date2);
    //convert date2 to utc
    // console.log(date.toUTCString());
    // console.log(date2.toUTCString());

    if(date.getTime() < date2.getTime()) {
        let html = pug.renderFile('public/countdown.pug', {dateCountdown: date2.toUTCString(), dateNow: date.toUTCString()});
        return res.send(html);
    }
    let html = pug.renderFile('public/GioiThieu.pug');
    return res.send(html);
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

        let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "'Tổng quan'!A:G");
        
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
        date.setHours(date.getHours() + 7);
        //auto add 0 to date, month, hour, minute
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        let month = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        let time = day + '/' + month + '/' + date.getFullYear() + ' ' + hour + ':' + minute + ':' + second;    
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

app.get('/rutgon', (req, res) => {
    let html = pug.renderFile('public/RutGonLink.pug');
    res.send(html);
});

app.post('/rutgon', async (req, res) => {
    let data = req.body;
    if(!data.LongURL) {
        return res.json({
            status: 400,
            message: "Vui lòng nhập link gốc cần được rút gọn"
        });
    }
    if(!data.ShortURL.startsWith('https://banhoctap.dev/') || data.ShortURL.length < 25) {
        return res.json({
            status: 400,
            message: "Link rút gọn không hợp lệ"
        });
    }
    let spreadsheetId = "1CmpEujfmtoF19ePYBikrdcKcJKurqsnxJ1VpXJz-Cso";
    let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "'Rút gọn link'!A:B");
    for (value in dataSheets) {
        if(dataSheets[value].at(0) == data.LongURL) 
            return res.json({
                status: 400,
                message: "Link bạn muốn rút gọn đã tồn tại",
                link: dataSheets[value].at(1)
            });
        if(dataSheets[value].at(1) == data.ShortURL)
            return res.json({
                status: 400,
                message: "Link rút gọn đã tồn tại. Vui lòng chọn link khác"
            });
    }
    await spreadsheetsModels.insertSpreadsheet(spreadsheetId, "'Rút gọn link'!A:B", [[
        data.LongURL,
        data.ShortURL,
        data.GhiChu
    ]]);
    return res.json({
        success: true,
        message: "Rút gọn link thành công",
        link: data.ShortURL
    });
})

app.get('/:linkrutgon', async(req, res) => {
    let spreadsheetId = "1CmpEujfmtoF19ePYBikrdcKcJKurqsnxJ1VpXJz-Cso";
    let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "'Rút gọn link'!A:B");
    for (value in dataSheets) {
        let url = 'https://banhoctap.dev/' + req.params.linkrutgon;
        console.log(url);
        console.log(dataSheets[value].at(1));
        if(dataSheets[value].at(1) == url) {
            return res.redirect(dataSheets[value].at(0));
        }
    }
    return res.redirect('/');
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
    if(!data.name || data.name.length < 5)
        return ({
            success: false,
            message: "Họ và tên không hợp lệ!"
        })
    if(!data.email || !data.email.includes('@') || !data.email.includes('.'))
        return ({
            success: false,
            message: "Email không hợp lệ. Khuyến khích sử dụng email của trường!"
        })
    if(!data.mssv || data.mssv.length != 8)
        return ({
            success: false,
            message: "Mã số sinh viên không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.LopSV)
        return ({
            success: false,
            message: "Lớp sinh viên không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.FacebookURL || !data.FacebookURL.includes('.com'))
        return ({
            success: false,
            message: "Facebook URL không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.LyDoThamGia || data.LyDoThamGia.length < 5)   
        return ({
            success: false,
            message: "Lý do tham gia không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.TinhCachMuonLamViec || data.TinhCachMuonLamViec.length < 5)
        return ({
            success: false,
            message: "Tính cách muốn làm việc không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.TinhCachKhongMuonLamViec || data.TinhCachKhongMuonLamViec.length < 5)
        return ({
            success: false,
            message: "Tính cách không muốn làm việc không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.TinhHuong || data.TinhHuong.length < 5) 
        return ({
            success: false,
            message: "Tình huống không hợp lệ. Vui lòng kiểm tra lại!"
        })
    if(!data.CauHoi2 || data.CauHoi2.length < 5)
        return ({
            success: false,
            message: "Câu hỏi 2 không hợp lệ. Vui lòng kiểm tra lại!"
        })
    return ({
        success: true,
        message: "Dữ liệu hợp lệ!"
    })
}
