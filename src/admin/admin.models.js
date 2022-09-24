const sql = require("mssql");
var fs = require('fs');
var json2html = require('json2html');
require('dotenv').config();

const configAdmin = {
    user: process.env.admin,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database,
    port: 1433
}

async function LayCauHoi(MaCH) {
    try {
        let SQLQuery = `SELECT TieuDe, MucDo, NoiDung, LuocDo, Input
            FROM dbo.Admin_CauHoi LEFT JOIN dbo.Admin_TestCase ON Admin_TestCase.MaCH = Admin_CauHoi.MaCH
            WHERE Admin_CauHoi.MaCH = '${MaCH}'`;

        let result = await TruyVan(SQLQuery);
        console.log("Lấy câu hỏi", result);
        if(result.statusCode != 200) 
            return ({
                statusCode: 400,
                message: 'Lấy câu hỏi thất bại'
            })
        else {
            return ({
                statusCode: 200,
                message: 'Lấy câu hỏi thành công',
                data: result.result.recordset[0]
            })
        }
    } catch(err) {
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Lấy câu hỏi thất bại'
        })
    }
}

async function ThemCauHoi(data) {
    try {
        let SQLQuery = `insert into Admin_CauHoi (MucDo, TieuDe, NoiDung, LuocDo, TinhTrang) 
            values (N'${data.MucDo}', N'${data.TieuDe}', N'${data.NoiDung}', N'${data.LuocDo}', '${data.TinhTrang}')`;
        let result = await TruyVan(SQLQuery);
        console.log("Thêm Câu Hỏi ", result);
        if(result.statusCode != 200) 
            return ({
                statusCode: 400,
                message: 'Thêm Câu Hỏi Thất Bại'
            })
        else {
            SQLQuery = `select MaCH from Admin_CauHoi where TieuDe = N'${data.TieuDe}' and NoiDung = N'${data.NoiDung}' and LuocDo = N'${data.LuocDo}'`;
            result = await TruyVan(SQLQuery);
            let MaCH = result.result.recordset[0].MaCH;
            console.log("Thêm Câu Hỏi ", MaCH);
            result = await ThemTestCase(MaCH, data.SQLQuery);
            if(result.statusCode != 200)
                return ({
                    statusCode: 400,
                    message: 'Thêm Test case Thất Bại'
                })
            return ({
                statusCode: 200,
                message: `Thêm Câu Hỏi Thành Công - Mã số câu hỏi: ${MaCH}`,
                MaCH: MaCH
            })
        }
    } catch(err) {  
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Thêm Câu Hỏi Thất Bại'
        })
    }
}

async function ThemCauHoiVaoBaiTap(MaBT, MaCH) {
    try {
        let SQLQuery = `insert into Admin_BaiTapCauHoi (MaBT, MaCH) values ('${MaBT}', '${MaCH}')`;
        let result = await TruyVan(SQLQuery);
        console.log("Thêm câu hỏi vào bài tập", result);
        return result;
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }
}

async function XuLySQL(SQLQuery) {
    SQLQuery = SQLQuery.toLowerCase();
    try {
        const result = await TruyVan(SQLQuery);
        console.log(result.result.recordset)
        return ({
            statusCode: result.statusCode,
            message: 'Thành công',
            result: result.result.recordset,
            html: json2html.render(result.result.recordset)
        });
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }

}

async function ThemTestCase(MaCH, SQLQuery) {
    try {    
        let QueryData = await XuLySQL(SQLQuery);
        if(QueryData.statusCode != 200) 
            return QueryData;
        SQLQuery = SQLQuery.replace(/'/g, '"');
        //Gọi truy vấn lưu kết quả testcase và câu lệnh mẫu
        let InsertSQLQuery = `insert into Admin_TestCase (MaCH, Input, Output) 
            values ('${MaCH}', '${SQLQuery}', '${JSON.stringify(QueryData.result)}')`;
        let ResultQueryInsert = await TruyVan(InsertSQLQuery);

        if(ResultQueryInsert.statusCode != 200) {
            GhiLog(`Lỗi Insert TestCase (admin.models) - ${InsertSQLQuery}\t${ResultQueryInsert}`);
            return ResultQueryInsert;
        }

        console.log("Thêm Testcase (admin.models)", ResultQueryInsert.result);

        return {
            statusCode: 200,
            message: 'Thành công',
            result: ResultQueryInsert.result.recordsets
        }
    } catch(err) {
        GhiLog(`Lỗi Insert TestCase (admin.models) - ${SQLQuery}\t${err}`);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }
}

async function SuaTestCase(MaCH, SQLQuery) {
    try {    
        let QueryData = await XuLySQL(SQLQuery);
        if(QueryData.statusCode != 200) 
            return QueryData;
        SQLQuery = SQLQuery.replace(/'/g, '"');
        //Gọi truy vấn lưu kết quả testcase và câu lệnh mẫu
        let UpdateSQLQuery = `update Admin_TestCase 
            set Input = '${SQLQuery}', Output = '${JSON.stringify(QueryData.result)}' 
            where MaCH = '${MaCH}'`;
        // let InsertSQLQuery = `insert into Admin_TestCase (MaCH, Input, Output) 
        //     values ('${MaCH}', '${SQLQuery}', '${JSON.stringify(QueryData.result)}')`;
        let ResultQueryInsert = await TruyVan(UpdateSQLQuery);

        if(ResultQueryInsert.statusCode != 200) {
            GhiLog(`Lỗi Update TestCase (admin.models) - ${InsertSQLQuery}\t${ResultQueryInsert}`);
            return ResultQueryInsert;
        }

        console.log("Sửa Testcase (admin.models)", ResultQueryInsert.result);

        return {
            statusCode: 200,
            message: 'Thành công',
            result: ResultQueryInsert.result.recordsets
        }
    } catch(err) {
        GhiLog(`Lỗi Update TestCase (admin.models) - ${SQLQuery}\t${err}`);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }
}

async function DanhSachBaiTap() {
    try {
        let SQLQuery = `SELECT DISTINCT Admin_BaiTap.MaBT, TieuDe, COUNT(DISTINCT Admin_BaiTapCauHoi.MaCH) AS SoBT, COUNT(Username) AS DaThucHien
        FROM dbo.Admin_BaiTap LEFT JOIN dbo.Admin_BaiTapCauHoi ON Admin_BaiTapCauHoi.MaBT = Admin_BaiTap.MaBT LEFT JOIN dbo.Admin_SQLSubmitHistory ON Admin_SQLSubmitHistory.MaCH = Admin_BaiTapCauHoi.MaCH
        GROUP BY Admin_BaiTap.MaBT, TieuDe`;
        let result = await TruyVan(SQLQuery);
        console.log("Danh sách bài tập", result);
        return result;
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }
}

async function DanhSachNhom() {
    try {
        let SQLQuery = `SELECT MaNhom, TenNhom
        FROM dbo.Admin_Nhom`;
        let result = await TruyVan(SQLQuery);
        console.log("Danh sách nhóm", result);
        return result;
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }
}

async function ThemBaiTap(data) {
    try {
        if(data.TrangThai) 
            data.TrangThai = 1;
        else
            data.TrangThai = 0;
        let SQLQuery = `insert into Admin_BaiTap (TieuDe, TgianBD, TgianKT, TrangThai) 
            values (N'${data.TieuDe}', '${data.TgianBD}', '${data.TgianKT}', '${data.TrangThai}');`;
        let result = await TruyVan(SQLQuery);
        console.log("Thêm Bài Tập ", result);
        if(result.statusCode != 200) 
            return ({
                statusCode: 400,
                message: 'Thêm Bài Tập Thất Bại'
            })
        else {
            SQLQuery = `select MaBT from Admin_BaiTap where TieuDe = N'${data.TieuDe}'`;
            result = await TruyVan(SQLQuery);
            console.log("Thêm Bài Tập ", result.result.recordset[0].MaBT);
            SQLQuery = `insert into Admin_BaiTapTheoNhom (MaBT, MaNhom) values ('${result.result.recordset[0].MaBT}', '${data.MaNhom}')`;
            result = await TruyVan(SQLQuery);
            console.log("Thêm Bài Tập ", result);
            return ({
                statusCode: 200,
                message: `Thêm Bài Tập Thành Công`,
            })
        }
    } catch(err) {  
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Thêm Bài Tập Thất Bại'
        })
    }
}

async function SuaBaiTap(data, MaBT) {
    try {
        if(data.TrangThai) 
            data.TrangThai = 1;
        else
            data.TrangThai = 0;
        let SQLQuery = `update Admin_BaiTap 
        set TieuDe = N'${data.TieuDe}', TgianBD = '${data.TgianBD}', TgianKT = '${data.TgianKT}', TrangThai = '${data.TrangThai}' 
        where MaBT = '${MaBT}'`;

        let result = await TruyVan(SQLQuery);
        console.log("Sửa Bài Tập ", result);
        if(result.statusCode != 200) 
            return ({
                statusCode: 400,
                message: 'Sửa Bài Tập Thất Bại'
            })
        else {
            SQLQuery = `update Admin_BaiTapTheoNhom 
            set MaNhom = '${data.MaNhom}' 
            where MaBT = '${MaBT}'`;
            //SQLQuery = `insert into Admin_BaiTapTheoNhom (MaBT, MaNhom) values ('${result.result.recordset[0].MaBT}', '${data.MaNhom}')`;
            result = await TruyVan(SQLQuery);
            console.log("Sửa Bài Tập ", result);
            return ({
                statusCode: 200,
                message: `Sửa Bài Tập Thành Công`,
            })
        }
    } catch(err) {  
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Thêm Bài Tập Thất Bại'
        })
    }
} 

async function LayBaiTap(MaBT) {
    try {
        let SQLQuery = `SELECT Admin_BaiTap.TieuDe as TieuDeBaiTap, Admin_CauHoi.TieuDe, Admin_BaiTapCauHoi.MaCH, MucDo, LuocDo, TgianBD, TgianKT, TrangThai
        FROM dbo.Admin_BaiTap LEFT JOIN dbo.Admin_BaiTapCauHoi ON Admin_BaiTapCauHoi.MaBT = Admin_BaiTap.MaBT LEFT JOIN dbo.Admin_CauHoi ON Admin_CauHoi.MaCH = Admin_BaiTapCauHoi.MaCH
        WHERE Admin_BaiTap.MaBT = '${MaBT}'`;   
        let result = await TruyVan(SQLQuery);
        console.log("Lấy Bài Tập ", result);
        return result;
    } catch(err) {  
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Lấy Bài Tập Thất Bại'
        })
    }
}

async function TaoQuanHe(SQLSchema) {
    try {
        let result = await TruyVanDacBiet(SQLSchema);
        console.log("Tạo mới quan hệ ", result);
        return result;
    } catch(err) {  
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Tạo mới quan hệ Thất Bại'
        })
    }
}

async function ChinhSuaCauHoi(MaCH, data) {
    try {
        let SQLQuery = `update Admin_CauHoi 
            set LuocDo =  N'${data.LuocDo}', MucDo = N'${data.MucDo}', TieuDe = N'${data.TieuDe}', NoiDung = N'${data.NoiDung}', TinhTrang = '${data.TinhTrang}'
            where MaCH = '${MaCH}'`;

        let result = await TruyVan(SQLQuery);
        console.log("Sửa Câu Hỏi ", result);
        if(result.statusCode != 200) 
            return ({
                statusCode: 400,
                message: 'Sửa Câu Hỏi Thất Bại'
            })
        else {
            result = await SuaTestCase(MaCH, data.SQLQuery);
            if(result.statusCode != 200)
                return ({
                    statusCode: 400,
                    message: 'Sửa Câu Hỏi Thất Bại'
                })
            else 
                return ({
                    statusCode: 200,
                    message: `Sửa Câu Hỏi Thành Công - Mã số câu hỏi: ${MaCH}`,
                    MaCH: MaCH
                })
        }
    } catch(err) {  
        console.log(err);
        return ({
            statusCode: 400,
            message: 'Thêm Câu Hỏi Thất Bại'
        })
    }
}

async function DanhSachCauHoi() {
    try {
        let SQLQuery = `SELECT * FROM dbo.Admin_CauHoi`;
        let result = await TruyVan(SQLQuery);
        console.log("Danh sách bài tập", result);
        return result;
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }
}

async function BangXepHang(MaBT) {
    try {
        let SQLQuery = `SELECT Admin_Users.username, fullname, KQ.KetQua, Admin_BaiTapCauHoi.MaCH, MaBT
        FROM dbo.Admin_ThanhVienNhom INNER JOIN dbo.Admin_Users ON Admin_Users.username = Admin_ThanhVienNhom.Username LEFT JOIN (
            SELECT Username, MAX(KetQua) AS KetQua, MaCH
            FROM dbo.Admin_SQLSubmitHistory
            GROUP BY Username, MaCH) KQ ON KQ.Username = Admin_Users.username LEFT JOIN dbo.Admin_BaiTapCauHoi ON Admin_BaiTapCauHoi.MaCH = KQ.MaCH
        WHERE MaBT = N'${MaBT}'
        ORDER BY Admin_BaiTapCauHoi.MaCH ASC`;
        let result = await TruyVan(SQLQuery);
        result = result.result.recordset;
        console.log("Bảng xếp hạng", result);
        let user = {};
        let dsCH = [];
        for(let i = 0; i < result.length; i++) 
            if(!dsCH.includes(result[i].MaCH)) 
                dsCH.push(result[i].MaCH);

        for(let i = 0; i < result.length; i++) {
            if(user[result[i].username] == undefined) 
                user[result[i].username] = [];
            
            user[result[i].username].push({
                "username": result[i].username,
                "fullname": result[i].fullname,
                "MaCH": result[i].MaCH, 
                "KetQua": result[i].KetQua
            });
        }
        let data = {
            "dsCH": dsCH,
            "user": user
        }
        console.log("Danh sách câu hỏi", data);
        return data;
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }   
}

async function XoaCauHoi(MaCH) {
    try {
        let SQLQuery = `DELETE FROM Admin_CauHoi WHERE MaCH = '${MaCH}'`;
        let result = await TruyVan(SQLQuery);
        return result;
    } catch(err) {
        console.log(err);
        return ({ 
            statusCode: 400,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Kiểm tra lại câu lệnh SQL!'
        });
    }   
}

exports.DanhSachCauHoi = DanhSachCauHoi;
exports.ChinhSuaCauHoi = ChinhSuaCauHoi;
exports.LayCauHoi = LayCauHoi;
exports.LayBaiTap = LayBaiTap;
exports.ThemCauHoi = ThemCauHoi;
exports.ThemTestCase = ThemTestCase;
exports.DanhSachBaiTap = DanhSachBaiTap;
exports.DanhSachNhom = DanhSachNhom;
exports.ThemBaiTap = ThemBaiTap;
exports.TaoQuanHe = TaoQuanHe;
exports.XuLySQL = XuLySQL;
exports.ThemCauHoiVaoBaiTap = ThemCauHoiVaoBaiTap;
exports.SuaBaiTap = SuaBaiTap;
exports.BangXepHang = BangXepHang;
exports.XoaCauHoi = XoaCauHoi;

async function TruyVan(SQLQuery) {
    try {
        let pool = await new sql.ConnectionPool(configAdmin);
        let result = await pool.connect();
        let queryResult = await result.query(SQLQuery);
        //console.log("Admin, QueryResult", queryResult);
        await pool.close();
        return {
            statusCode: 200,
            user: 'Admin',
            message: "Thành công",
            result: queryResult
        };
    } catch(err) {
        console.log("Lỗi TruyVan (admin.models)", SQLQuery, err);
        GhiLog(`Lỗi truy vấn SQL - ${SQLQuery}\t${err}`);

        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!'
        };
    }
}

async function TruyVanDacBiet(SQLQuery) {    
    try {
        let pool = await new sql.ConnectionPool(configAdmin);
        let result = await pool.connect();
        console.log("TruyVanDacBiet", SQLQuery);
        let queryResult = await result.batch(SQLQuery.SQLSchema);
        //create new table with the same schema as the table you want to copy
        //console.log("Admin, QueryResult", queryResult);
        await pool.close();
        return {
            statusCode: 200,
            user: 'Admin',
            message: "Thành công",
            result: queryResult
        };
    } catch(err) {
        console.log("Lỗi TruyVan (admin.models)", SQLQuery, err);
        GhiLog(`Lỗi truy vấn SQL - ${SQLQuery}\t${err}`);

        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!'
        };
    }
}

async function GhiLog(data) {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    let time = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    let log = `${time} - ${data}`;

    //fs.appendFileSync('./logs/admin/admin.models.log', log + '\n');
}
