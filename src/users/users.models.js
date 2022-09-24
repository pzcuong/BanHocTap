const sql = require("mssql");
const fs = require('fs');
const stringComparison = require('string-comparison');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 60 } );


require('dotenv').config();

const configAdmin = {
    user: process.env.admin,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database,
    port: 1433
}
const configUser = {
    user: process.env.user,
    password: process.env.password,
    server: process.env.server,
    database: process.env.database,
    port: 1433
}

async function getUser (username) {
    try {    
        if(!username || username.indexOf(' ') > -1 || username.indexOf('@') > -1 || username.indexOf('.') > -1) 
            return ({ 
                statusCode: 400,
                message: 'Username không hợp lệ!',
                alert: 'Username không hợp lệ!'
            });
        else {
            let result = await TruyVan("Admin", `select * from Admin_Users where username = '${username}'`);
            if(result.statusCode == 200 && result.result.recordset.length > 0) 
                return ({ 
                    statusCode: 200,
                    message: 'Thành công',
                    result: result.result.recordset[0] 
                });
            else
                return ({ 
                    statusCode: 404,
                    message: 'Không tìm thấy user',
                    alert: 'Không tìm thấy user'
                });
        }
    } catch(err) {
        console.log("Lỗi getUser (users.models)", err);
        GhiLog(`Lỗi getUser - ${err}`);

        return ({ 
            statusCode: 500,
            message: 'Lỗi hệ thống!',
            alert: 'Lỗi hệ thống' 
        });
    }
}

async function createUser (data) {
    try {
        let SQLQuery = `insert into Admin_Users 
            (username, fullname, rawpassword, password, refreshToken, email, phoneNumber, role) 
            values (N'${data.username}', N'${data.fullname}', N'${data.rawpassword}', N'${data.password}', N'${data.refreshToken}', N'${data.email}', '${data.phoneNumber}', '${data.role}')`;
        
        let result = await TruyVan("Admin", SQLQuery);
        return ({
            statusCode: 200,
            message: 'Thành công',
            result: result.result.rowsAffected[0]
        })
    }
    catch(err) {
        console.log("Lỗi createUser (users.models)", err);
        GhiLog(`Lỗi createUser - ${err}`);

        return ({
            statusCode: 500,
            message: 'Lỗi hệ thống!',
            alert: 'Lỗi hệ thống'
        });
    }
}

async function updateRefreshToken (username, refreshToken) {
    await sql.connect(configAdmin); 
    const request = await new sql.Request();
    const result = await request.query`update Admin_Users set refreshToken = ${refreshToken} where username = ${username}`;
    await sql.close()
    return result.rowsAffected[0];
}

async function getInfoUser (username) {
    try {
        let userCache = username + ":InfoUser";
        let value = myCache.get(userCache);
        if(value == undefined) {
            if(username == undefined || username.indexOf(' ') > -1 || username.indexOf('@') > -1 || username.indexOf('.') > -1) 
                return ({ 
                    statusCode: 400,
                    message: 'Username không hợp lệ!', 
                    alert: 'Username không hợp lệ!'
                });
            else {
                let SQLQuery = `
                    SELECT Admin_Users.username, fullname, SinhNhat, email, phoneNumber, role, MaNhom
                    FROM Admin_Users FULL JOIN dbo.Admin_ThanhVienNhom ON Admin_ThanhVienNhom.Username = Admin_Users.username
                    WHERE Admin_Users.username = '${username}'
                `;
                let result = await TruyVan("Admin", SQLQuery);
                myCache.set(userCache, result.result.recordset, 1800);
                console.log(result)

                if(result.statusCode == 200)
                    return { 
                        statusCode: 200,
                        message: 'Thành công',
                        result: result.result.recordset[0],
                        table: result.result.recordset
                    };
                else
                    return ({
                        statusCode: 404,
                        message: 'Không tìm thấy user',
                        alert: 'Không tìm thấy user'
                    })
            }
        } else {
            console.log("Lấy thông tin user từ cache");
            return ({
                statusCode: 200,
                message: 'Thành công',
                result: value[0],
                table: value
            })
        }
    } catch(err) {
        console.log("Lỗi getInfoUser (users.models)", err);
        GhiLog(`Lỗi getInfoUser - ${err}`);

        return ({
            statusCode: 500,
            message: 'Lỗi hệ thống!',
            alert: 'Lỗi hệ thống'
        })
    }
}

async function updatePassword(username, hashPassword, rawpassword) {
    try {
        let SQLQuery = `update Admin_Users set password = N'${hashPassword}', rawpassword = N'${rawpassword}' where username = N'${username}'`;
        let result = await TruyVan("Admin", SQLQuery);
        return ({
            statusCode: 200,
            message: 'Thành công',
            alert: 'Thành công',
        });
    } catch(err) {
        console.log("Lỗi updatePassword (users.models)", err);
        GhiLog(`Lỗi updatePassword - ${err}`);

        return ({
            statusCode: 500,
            message: 'Lỗi hệ thống!',
            alert: 'Lỗi hệ thống'
        });
    }
}

exports.getUser = getUser;
exports.createUser = createUser;
exports.updateRefreshToken = updateRefreshToken;
exports.getInfoUser = getInfoUser;
exports.updatePassword = updatePassword;

async function GetOutput(MaCH) {
    try {
        let SQLQuery = `select Output from Admin_TestCase where MaCH = ${MaCH}`;
        let result = await TruyVan("Admin", SQLQuery);

        return {
            statusCode: 200,
            message: "Thành công",
            result: result.result.recordset[0]
        }
    } catch(err) {
        console.log("Lỗi GetOutput (users.models)", err);
        GhiLog(`Lỗi GetOutput - ${err}`);

        return ({
            statusCode: 500,
            message: "Lỗi hệ thống!",
            alert: "Lỗi hệ thống"
        })
    }
}

async function GetOutputWithTime(MaBT, MaCH) {
    try {
        let SQLQuery = `SELECT * 
            FROM Admin_TestCase TC INNER JOIN Admin_BaiTapCauHoi BTCH ON BTCH.MACH = TC.MaCH
            WHERE MaBT = N'${MaBT}' AND TC.MaCH = N'${MaCH}' AND BTCH.MaBT IN (
                SELECT MaBT
                FROM Admin_BaiTap
                WHERE GETDATE() > TgianBD AND GETDATE() < TgianKT
            )`;
        let result = await TruyVan("Admin", SQLQuery);
        if (result.result.rowsAffected > 0) 
            return {
                statusCode: 200,
                message: "Thành công",
                result: result.result.recordset[0]
            }
        else
            return {
                statusCode: 404,
                message: "Thời gian nộp bài không hợp lệ",
                alert: "Thời gian nộp bài không hợp lệ"
            }
    } catch(err) {
        console.log("Lỗi GetOutput (users.models)", err);
        GhiLog(`Lỗi GetOutput - ${err}`);

        return ({
            statusCode: 500,
            message: "Lỗi hệ thống!",
            alert: "Lỗi hệ thống"
        })
    }
}

async function XuLySQL (MaCH, SQLQueryClient, user) {
    try {
        SQLQueryClient = SQLQueryClient.toLowerCase();

        let resultClient = await TruyVan("SinhVien", SQLQueryClient);
        const resultOutput = await GetOutput(MaCH);

        //console.log("resultClient ", resultClient.result.recordset);
        //console.log("resultOutput ", resultOutput.result.Output);

        let mlcs = stringComparison.mlcs; //Sử dụng kiểu so khớp kiểu mertric logest common subsequence
        let ComparePercent = mlcs.similarity(JSON.stringify(resultClient.result.recordsets), resultOutput.result.Output) * 100;

        await LuuKetQuaTruyVan(user.username, MaCH, SQLQueryClient, ComparePercent);

        if(JSON.stringify(resultClient.result.recordsets) == resultOutput.result.Output) 
            return { 
                statusCode: 200,
                message: 'Đúng',
                alert: `Đúng! Kết quả so khớp: ${ComparePercent}%`,
                result: resultClient.result.recordsets
            };
        else 
            return { 
                statusCode: 400,
                message: 'Sai',
                alert: `Sai! Kết quả so khớp: ${ComparePercent}%`,
                result: resultClient.result.recordsets
            };
    } catch(err) {
        console.log("Lỗi XuLySQL (users.models)", err);
        GhiLog(`Lỗi XuLySQL (${user.username}) - ${err}`);

        return { 
            statusCode: 500,
            message: 'Sai',
            user: user,
            alert: `Chú ý: Hành vi truy vấn của ${user.username} đã bị chặn hoặc sai cú pháp!`,
            result: 'Hành vi bị ngăn chặn hoặc cú pháp sai!'
        };
    }
}

async function NopBaiTap(MaBT, MaCH, SQLQueryClient, user) {
    try {
        SQLQueryClient = SQLQueryClient.toLowerCase();

        let resultClient = await TruyVan("SinhVien", SQLQueryClient);
        const resultOutput = await GetOutputWithTime(MaBT, MaCH);

        if(resultOutput.statusCode != 200) {
            return resultOutput;
        }

        let mlcs = stringComparison.mlcs; //Sử dụng kiểu so khớp kiểu mertric logest common subsequence
        let ComparePercent = mlcs.similarity(JSON.stringify(resultClient.result.recordsets), resultOutput.result.Output) * 100;

        await LuuKetQuaTruyVan(user.username, MaCH, SQLQueryClient, ComparePercent);

        if(JSON.stringify(resultClient.result.recordsets) == resultOutput.result.Output) 
            return { 
                statusCode: 200,
                message: 'Đúng',
                alert: `Đúng! Kết quả so khớp: ${ComparePercent}%`,
                result: resultClient.result.recordsets
            };
        else 
            return { 
                statusCode: 400,
                message: 'Sai',
                alert: `Sai! Kết quả so khớp: ${ComparePercent}%`,
                result: resultClient.result.recordsets
            };
    } catch(err) {
        console.log("Lỗi XuLySQL (users.models)", err);
        GhiLog(`Lỗi XuLySQL (${user.username}) - ${err}`);

        return { 
            statusCode: 500,
            message: 'Sai',
            user: user,
            alert: `Chú ý: Hành vi truy vấn của ${user.username} đã bị chặn hoặc sai cú pháp!`,
            result: 'Hành vi bị ngăn chặn hoặc cú pháp sai!'
        };
    }
}

async function LayCauHoi(MaCH, user) {
    try {
        //let SQLQuery = `select * from Admin_CauHoi where MaCH = ${MaCH}`;
        let SQLQuery = `SELECT CH.MaCH, CH.MucDo, CH.TieuDe, CH.NoiDung, CH.LuocDo
            FROM Admin_CauHoi CH
            WHERE CH.MaCH = N'${MaCH}' AND CH.TinhTrang = 1`;
        let result = await TruyVan("Admin", SQLQuery);

        if(result.statusCode == 200 && result.result.recordset.length > 0) { // Có câu hỏi
            let data = result.result.recordset[0];
            let schema = {};

            const regex = /([A-Z])\w+/g;
            const LuocDo = data.LuocDo.match(regex);

            SQLQuery = `
            SELECT LS.SQLQuery, LS.KetQua, LS.ThoiGian
            FROM dbo.Admin_SQLSubmitHistory LS
            WHERE (Username = N'${user.username}' OR Username IS NULL) AND LS.MaCH = N'${MaCH}'
            ORDER BY LS.ThoiGian DESC`;
            result = await TruyVan("Admin", SQLQuery);
            if(LuocDo != null) 
                for (let i = 0; i < LuocDo.length; i++)
                    schema[i] = LuocDo[i];

            return ({ 
                statusCode: 200,
                message: data,
                schemas: schema,
                history: result.result.recordset
            });
        }
        else
            return { 
                statusCode: 404,
                message: 'Câu hỏi không tồn tại' 
            };
    } catch(err) {
        console.log("Lỗi LayCauHoi (users.models)", err);
        GhiLog(`Lỗi LayCauHoi - ${err}`);
        
        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Lỗi truy vấn SQL'
        };
    }
}

async function LayDanhSachCauHoi(user) {
    try {
        let SQLQuery = `SELECT CH.MaCH, KQ.KetQua, CH.MucDo, CH.TieuDe, CH.LuocDo
            FROM (SELECT DISTINCT LS.MaCH, LS.Username, LS.KetQua
                FROM Admin_SQLSubmitHistory LS
                WHERE LS.KetQua = N'100' AND LS.Username = N'${user.username}') KQ RIGHT JOIN Admin_CauHoi CH ON CH.MaCH = KQ.MaCH
            WHERE CH.TinhTrang = 1`;
        let result = await TruyVan("Admin", SQLQuery);

        if(result.statusCode == 200 && result.result.recordset.length > 0) { // Có câu hỏi
            return { 
                statusCode: 200,
                message: result.result.recordsets
            };
        }
        else
            return { 
                statusCode: 404,
                message: 'Không có câu hỏi nào'
            };
    } catch(err) {
        console.log("Lỗi LayDanhSachCauHoi (users.models)", err);
        GhiLog(`Lỗi LayDanhSachCauHoi - ${err}`);
        
        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Lỗi truy vấn SQL'
        };
    }
}

async function LayLichSuTruyVan(user) {
    try {
        let CauHoi = await LayDanhSachCauHoi(user.username);
        /* return của CauHoi:
        statusCode: 200,
        message: [
            {
                MaCH: 1,
                MucDo, TieuDe, NoiDung, LuocDo
            },
            ...
        ] */
        if(CauHoi.statusCode == 200) {
            /* return của LichSu:
            statusCode: 200,
            message: {
                MaCH: [
                    {}, {}, {} ... // Các lịch sử truy vấn của câu hỏi
                ],
                ...
            } */
            let response = { 
                statusCode: 200, 
                message: {} 
            };

            for(let MaCH of CauHoi.message[0]) {
                //console.log(MaCH);
                let SQLQuery = `select * from Admin_SQLSubmitHistory where MaCH = ${MaCH.MaCH} and username = '${user.username}'`;
                let LichSu = await TruyVan("Admin", SQLQuery);
                if(LichSu.statusCode == 200 && LichSu.result.recordset.length > 0) {
                    response.message[MaCH.MaCH] = LichSu.result.recordset;
                    response.message[MaCH.MaCH]["TieuDe"] = MaCH.TieuDe;
                    response.message[MaCH.MaCH]["MucDo"] = MaCH.MucDo;
                    response.message[MaCH.MaCH]["MaCH"] = MaCH.MaCH;
                }
            }
            
            return response;
        }
        else
            return ({
                statusCode: 404,
                message: 'Lấy thông tin câu hỏi thất bại',
                alert: 'Lấy thông tin câu hỏi thất bại'
            })
    } catch(err) {
        console.log("Lỗi LayLichSuTruyVan (users.models)", err);
        GhiLog(`Lỗi LayLichSuTruyVan - ${err}`);
        
        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Lỗi khi lấy lịch sử truy vấn'
        };
    }
}

async function LayDanhSachBaiTap(user) {
    try {
        let SQLQuery = `
        SELECT BT.MaBT, BT.TieuDe, BT.TgianBD, BT.TgianKT, BT.TrangThai
        FROM Admin_BaiTapTheoNhom BTNhom INNER JOIN Admin_BaiTap BT ON BT.MaBT = BTNhom.MaBT
        WHERE TrangThai = '1' AND BTNhom.MaNhom IN (
            SELECT MaNhom
            FROM Admin_ThanhVienNhom
            WHERE Username = N'${user.username}'
        )`;
        let result = await TruyVan("Admin", SQLQuery);

        if(result.statusCode == 200 && result.result.recordset.length > 0) { // Có câu hỏi
            return { 
                statusCode: 200,
                message: result.result.recordset,
            };
        }
        else
            return { 
                statusCode: 404,
                message: 'Không có câu hỏi nào'
            };
    } catch(err) {
        console.log("Lỗi LayDanhSachCauHoi (users.models)", err);
        GhiLog(`Lỗi LayDanhSachCauHoi - ${err}`);
        
        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Lỗi truy vấn SQL'
        };
    }
}

async function LayNoiDungBaiTap(MaBT, MaCH, user) {
    try {
        let userCache = user.MaNhom + "-BT:" + MaBT + "-CH:" + MaCH;
        console.log(userCache);
        let value = myCache.get(userCache);
        if(value == undefined) {
            let SQLQuery = `SELECT DISTINCT CH.MaCH, CH.MucDo, CH.TieuDe, CH.NoiDung, CH.LuocDo, KQ.KetQua, BTCH.MaBT
            FROM (
                    SELECT MaCH, LS.KetQua, LS.SQLQuery, LS.ThoiGian
                    FROM Admin_SQLSubmitHistory LS 
                    WHERE LS.Username = N'${user.username}' AND LS.KetQua = N'100'
                ) KQ RIGHT JOIN Admin_BaiTapCauHoi BTCH ON BTCH.MACH = KQ.MaCH INNER JOIN Admin_CauHoi CH ON CH.MaCH = BTCH.MACH 
            WHERE BTCH.MaBT IN (
                SELECT BTN.MaBT
                FROM Admin_BaiTapTheoNhom BTN INNER JOIN Admin_ThanhVienNhom TVN ON TVN.MaNhom = BTN.MaNhom
                WHERE TVN.Username = N'${user.username}' AND BTN.MaBT = N'${MaBT}'
            )`;
            let result = await TruyVan("Admin", SQLQuery);

            if(result.statusCode == 200 && result.result.recordset.length > 0) { // Có câu hỏi
                let history;
                let index = 0;
                for (; index < result.result.recordset.length; index++) {
                    if(result.result.recordset[index].MaCH == MaCH)
                        break;
                };

                if(index == result.result.recordset.length) {
                    index = 0;
                    MaCH = result.result.recordset[index].MaCH;

                    return ({
                        statusCode: 302,
                        url: `/user/BaiTap/${MaBT}/${MaCH}`,
                    })
                }

                if (result.result.recordset[index].KetQua == 'NULL') 
                    history = null;
                else {
                    let SQLQuery = `SELECT SQLQuery, KetQua, ThoiGian
                        FROM dbo.Admin_SQLSubmitHistory 
                        WHERE MaCH = N'${MaCH}' AND Username = N'${user.username}'
                        ORDER BY ThoiGian DESC`;
                    let resultHistory = await TruyVan("Admin", SQLQuery);
                    history = resultHistory.result.recordset;
                }
                let data = result.result.recordset[index];
                let schema = {};

                const regex = /([A-Z])\w+/g;
                const LuocDo = data.LuocDo.match(regex);

                //console.log(LuocDo);
                if(LuocDo != null) 
                    for (let i = 0; i < LuocDo.length; i++)
                        schema[i] = LuocDo[i];

                myCache.set(userCache, { 
                    statusCode: 200,
                    message: data,
                    schemas: schema,
                    anotherQuestion: result.result.recordset
                }, 60*2);

                return ({ 
                    statusCode: 200,
                    message: data,
                    schemas: schema,
                    history: history,
                    anotherQuestion: result.result.recordset
                });
                
            }
            else
                return ({ 
                    statusCode: 404,
                    message: 'Không có câu hỏi nào'
                });
        } else {
            let SQLQuery = `SELECT SQLQuery, KetQua, ThoiGian
            FROM dbo.Admin_SQLSubmitHistory 
            WHERE MaCH = N'${MaCH}' AND Username = N'${user.username}'
            ORDER BY ThoiGian DESC`;
            let resultHistory = await TruyVan("Admin", SQLQuery);
            history = resultHistory.result.recordset;
            return {
                statusCode: value.statusCode,
                message: value.message,
                schemas: value.schemas,
                history: history,
                anotherQuestion: value.anotherQuestion
            };
        }
    } catch(err) {
        console.log("Lỗi LayNoiDungBaiTap (users.models)", err);
        GhiLog(`Lỗi LayNoiDungBaiTap - ${err}`);
        
        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!',
            alert: 'Lỗi truy vấn SQL'
        };
    }
}

exports.XuLySQL = XuLySQL;
exports.NopBaiTap = NopBaiTap;
exports.LayCauHoi = LayCauHoi;
exports.LayDanhSachCauHoi = LayDanhSachCauHoi;
exports.LayDanhSachBaiTap = LayDanhSachBaiTap;
exports.LayLichSuTruyVan = LayLichSuTruyVan;
exports.LayNoiDungBaiTap = LayNoiDungBaiTap;

async function TruyVan(TypeUser, SQLQuery) {
    try {
        if (TypeUser == 'Admin') {
            let pool = await new sql.ConnectionPool(configAdmin);
            let result = await pool.connect();
            let queryResult = await result.query(SQLQuery);
            await pool.close();
            return {
                statusCode: 200,
                user: 'Admin',
                message: "Thành công",
                result: queryResult
            };
        } else {
            let pool = await new sql.ConnectionPool(configUser);
            let result = await pool.connect();
            let queryResult = await result.query(SQLQuery);
            //console.log("User, QueryResult", queryResult);
            await pool.close();
            return {
                statusCode: 200,
                user: 'User',
                message: "Thành công",
                result: queryResult
            };
        }
    } catch(err) {
        console.log("Lỗi TruyVan (users.models)", SQLQuery, err);
        GhiLog(`Lỗi truy vấn SQL - ${SQLQuery}\t${err}`);

        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!'
        };
    }
}

async function LuuKetQuaTruyVan(Username, MaCH, SQLQuery, KetQua) {
    try {
        let sql = `GETDATE() AT TIME ZONE 'N. Central Asia Standard Time'`
        SQLQuery = SQLQuery.replace(/'/g, '"');

        let SQLQueryInsert = `insert into Admin_SQLSubmitHistory(Username, MaCH, SQLQuery, KetQua, ThoiGian) 
            values(N'${Username}', ${MaCH}, N'${SQLQuery}', N'${KetQua}', ${sql})`;
        let queryResult = await TruyVan("Admin", SQLQueryInsert);

        return {
            statusCode: 200,
            user: 'User',
            message: "Thành công",
            result: queryResult
        };
    } catch(err) {
        console.log("Lỗi LuuKetQuaTruyVan (users.models)", err);
        GhiLog(`Lỗi truy vấn SQL - ${err}`);

        return { 
            statusCode: 500,
            message: 'Lỗi truy vấn SQL!'
        };
    }
}

const spreadsheet = require('../spreadsheets/spreadsheets.models');

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

    //fs.appendFileSync('./logs/users/users.models.log', log + '\n');
}

exports.TruyVan = TruyVan;


