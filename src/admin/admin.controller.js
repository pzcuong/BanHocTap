const pug = require('pug');
const adminModel = require('../admin/admin.models');
const usersModel = require('../users/users.models');

async function ThemCauHoiTrongBaiTap(req, res) {
    try {
        const data = req.body;
        const MaBT = req.params.MaBT;

        if(data.type == 'TaoQuanHe') {
            if(!data.SQLSchema)
                return res.status(400).send({message: 'Missing fields'});

            const result = await adminModel.TaoQuanHe(data);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        }
        else if(data.type == 'TaoCauHoi') {
            if(!data.TieuDe || !data.NoiDung || !data.SQLQuery)
                return res.status(400).send({message: 'Missing fields'});
            const result = await adminModel.ThemCauHoi(data);

            await adminModel.ThemCauHoiVaoBaiTap(MaBT, result.MaCH);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        }
        else if(data.type == 'KiemThuTestCase') {
            if(!data.SQLQuery)
                return res.status(400).send({message: 'Missing fields'});
            const result = await adminModel.XuLySQL(data.SQLQuery);
            //console.log(result);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message,
                    //result: JSON.stringify(result.result)
                    result: result.html
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        }
        else 
            return res.status(400).send({message: 'Không xác định được loại câu hỏi'});
    } catch (error) {
        console.log(error);
    }
}

async function ThemMoiCauHoi(req, res) {
    try {
        const data = req.body;
        if(data.type == 'TaoCauHoi') {
            if(!data.TieuDe || !data.NoiDung || !data.SQLQuery)
                    return res.status(400).send({message: 'Missing fields'});
            const result = await adminModel.ThemCauHoi(data);

            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        } 
        else if(data.type == 'KiemThuTestCase') {
            if(!data.SQLQuery)
                return res.status(400).send({message: 'Missing fields Testcase'});
            const result = await adminModel.XuLySQL(data.SQLQuery);
            console.log(result);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message,
                    result: JSON.stringify(result.result)
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        }
        else 
            return res.status(400).send({message: 'Không xác định được loại câu hỏi'});
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: 'Thêm câu hỏi thất bại'});
    }
}

async function LayCauHoi(req, res, next) {
    try {
        const MaCH = req.params.MaCH;
        let result = await adminModel.LayCauHoi(MaCH, req.user.result);
        if (result.statusCode == 200) {
            let html = pug.renderFile('public/admin/ChinhSuaCauHoi.pug', {
                data: result.data
            });

            res.send(html);
        } else {
            let html = pug.renderFile('public/404.pug', { 
                message: result.message,
                redirect: '/admin/ThemTestCase/1'
            });
            res.send(html);
        }
    } catch (error) {
        let html = pug.renderFile('public/404.pug', { 
            message: "Không tồn tại câu hỏi",
            redirect: '/admin/QuanLyCauHoi/',
            href: "Đi đến trang quản lý câu hỏi"
        });
        res.send(html);
    }
}

async function ChinhSuaCauHoi(req, res, next) {
    try {
        const data = req.body;
        const MaCH = req.params.MaCH;

        if(data.type == 'TaoQuanHe') {
            if(!data.SQLSchema)
                return res.status(400).send({message: 'Missing fields'});

            const result = await adminModel.TaoQuanHe(data);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Tạo quan hệ thất bại'
                });
        }
        else if(data.type == 'SuaCauHoi') {
            if(!data.TieuDe || !data.NoiDung || !data.SQLQuery)
                return res.status(400).send({message: 'Missing fields'});
            const result = await adminModel.ChinhSuaCauHoi(MaCH, data);

            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        }
        else if(data.type == 'KiemThuTestCase') {
            if(!data.SQLQuery)
                return res.status(400).send({message: 'Missing fields'});
            const result = await adminModel.XuLySQL(data.SQLQuery);
            //console.log(result);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message,
                    //result: JSON.stringify(result.result),
                    result: result.html
                });
            else
                return res.send({
                    statusCode: 400,
                    message: 'Thêm câu hỏi thất bại'
                });
        }
        else if (data.type == 'XoaCauHoi') {
            const result = await adminModel.XoaCauHoi(MaCH);
            if(result.statusCode === 200)
                return res.send({
                    statusCode: 200,
                    message: result.message
                });
            return res.send({
                statusCode: 400,
                message: 'Xóa câu hỏi thất bại'
            });
        }
        else 
            return res.status(400).send({message: 'Không xác định được loại câu hỏi'});
    } catch (error) {
        console.log(error);
    }
}

async function ThemTestCase(req, res, next) {
    const MaCH = req.params.MaCH;
    let result = await adminModel.ThemTestCase(MaCH, req.body.SQLQuery);
    console.log(result);
    if(result.statusCode === 200)
        return res.status(200).send({
            message: 'Thêm testcase thành công',
            result: result   
        });
    else
        return res.status(400).send({message: 'Thêm testcase thất bại'});
}

async function DanhSachCauHoi(req, res) { 
    let result = await adminModel.DanhSachCauHoi();
    if(result.statusCode === 200) {
        let html = pug.renderFile('public/admin/QuanLyCauHoi.pug', {
            questionList: result.result.recordset,
        });
        res.send(html);
    } else {
        let html = pug.renderFile('public/404.pug', { 
            message: result.message,
            redirect: '/admin/QuanLyCauHoi'
        });
        res.send(html);
    }
}

async function DanhSachBaiTap(req, res) { 
    let result = await adminModel.DanhSachBaiTap();
    let dsNhom = await adminModel.DanhSachNhom();
    if(result.statusCode === 200) {
        let html = pug.renderFile('public/admin/QuanLyBaiTap.pug', {
            questionList: result.result.recordset,
            dsNhom: dsNhom.result.recordset
        });
        res.send(html);
    } else {
        let html = pug.renderFile('public/404.pug', { 
            message: result.message,
            redirect: '/admin/QuanLyBaiTap'
        });
        res.send(html);
    }
}

async function ThemBaiTap(req, res) {
    try {
        const data = req.body;
        console.log(data);
        
        if(!data.TieuDe || !data.MaNhom || !data.TgianBD || !data.TgianKT)
            return res.status(400).send({message: 'Missing fields'});
        const result = await adminModel.ThemBaiTap(data);
        if(result.statusCode === 200)
            return res.send({
                statusCode: 200,
                message: result.message
            });
        else
            return res.send({
                statusCode: 400,
                message: 'Thêm bài tập thất bại'
            });
    } catch (error) {
        console.log(error);
    }
}

async function SuaBaiTap(req, res) {
    try {
        const data = req.body;
        const MaBT = req.params.MaBT;
        console.log(data);
        
        if(!data.TieuDe || !data.MaNhom || !data.TgianBD || !data.TgianKT)
            return res.status(400).send({message: 'Missing fields'});
        const result = await adminModel.SuaBaiTap(data, MaBT);
        if(result.statusCode === 200)
            return res.send({
                statusCode: 200,
                message: result.message
            });
        else
            return res.send({
                statusCode: 400,
                message: 'Sửa bài tập thất bại'
            });
    } catch (error) {
        console.log(error);
    }
}

async function LayBaiTap(req, res) {
    try {
        const MaBT = req.params.MaBT;
        let result = await adminModel.LayBaiTap(MaBT);
        let dsNhom = await adminModel.DanhSachNhom();
        let BXH = await adminModel.BangXepHang(MaBT);
        console.log(BXH.user);
        if(result.statusCode === 200) {
            let html = pug.renderFile('public/admin/QuanLyCauHoiTrongBaiTap.pug', {
                TieuDeBaiTap: result.result.recordset[0].TieuDeBaiTap,
                questionList: result.result.recordset,
                dsNhom: dsNhom.result.recordset,
                BXH: BXH
            });
            res.send(html);
        } else {
            let html = pug.renderFile('public/404.pug', { 
                message: result.message,
                redirect: '/admin/QuanLyBaiTap'
            });
            res.send(html);
        }
    } catch (error) {
        console.log(error);
    }
}

exports.ThemCauHoiTrongBaiTap = ThemCauHoiTrongBaiTap;
exports.ThemTestCase = ThemTestCase;
exports.LayCauHoi = LayCauHoi;
exports.DanhSachBaiTap = DanhSachBaiTap;
exports.ThemBaiTap = ThemBaiTap;
exports.LayBaiTap = LayBaiTap;
exports.ChinhSuaCauHoi = ChinhSuaCauHoi;
exports.DanhSachCauHoi = DanhSachCauHoi;
exports.ThemMoiCauHoi = ThemMoiCauHoi;
exports.SuaBaiTap = SuaBaiTap;