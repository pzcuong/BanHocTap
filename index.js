var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');
var pug = require('pug');
var compression = require('compression');

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

app.get('/:linkrutgon', async(req, res) => {
    let spreadsheetId = "1CmpEujfmtoF19ePYBikrdcKcJKurqsnxJ1VpXJz-Cso";
    let dataSheets = await spreadsheetsModels.getSpreadsheet(spreadsheetId, "'Rút gọn link'!A:B");
    for (value in dataSheets) {
        let url = 'https://link.banhoctap.dev/' + req.params.linkrutgon;
        console.log(url);
        console.log(dataSheets[value].at(1));
        if(dataSheets[value].at(1) == url) 
            return res.redirect(dataSheets[value].at(0));
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
