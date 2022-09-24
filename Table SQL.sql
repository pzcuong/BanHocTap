CREATE TABLE Admin_Nhom (
	MaNhom NVARCHAR(50) PRIMARY KEY,
	TenNhom NVARCHAR(MAX)
)

INSERT INTO dbo.Admin_Nhom
(
    MaNhom,
    TenNhom
)
VALUES
(   N'IT004_BHT', -- MaNhom - nvarchar(50)
    N'IT004_BHT'  -- TenNhom - nvarchar(max)
    )

CREATE TABLE Admin_ThanhVienNhom (
	Username NVARCHAR(50),
	MaNhom NVARCHAR(50),
	CONSTRAINT PK_Username_MaNhom PRIMARY KEY(Username, MaNhom)
)

DECLARE @username NVARCHAR(50)
DECLARE db_cursor CURSOR FOR 
	SELECT username
	FROM Admin_Users

OPEN db_cursor  
FETCH NEXT FROM db_cursor INTO @username

WHILE @@FETCH_STATUS = 0  
BEGIN  
      INSERT INTO dbo.Admin_ThanhVienNhom
      (
          Username,
          MaNhom
      )
      VALUES
      (   @username, -- Username - nvarchar(50)
          N'IT004_BHT'  -- MaNhom - nvarchar(50)
          )
      FETCH NEXT FROM db_cursor INTO @username 
END 

CLOSE db_cursor  
DEALLOCATE db_cursor 

CREATE TABLE Admin_BaiTapTheoNhom (
	MaNhom NVARCHAR(50),
	MaBT INT,
	CONSTRAINT PK_MaNhom_MaBT PRIMARY KEY(MaNhom, MaBT)
)

CREATE TABLE Admin_BaiTap (
	MaBT INT PRIMARY KEY IDENTITY(1,1),
	TieuDe NVARCHAR(MAX),
	TgianBD DATETIME,
	TgianKT DATETIME,
	TrangThai INT
)

CREATE TABLE Admin_CauHoi (
	MaCH INT PRIMARY KEY IDENTITY(1,1),
	MucDo NVARCHAR(MAX),
	TieuDe NVARCHAR(MAX),
	NoiDung NVARCHAR(MAX),
	LuocDo NVARCHAR(MAX),
	TinhTrang INT
)

CREATE TABLE Admin_TestCase (
	MaTestCase INT PRIMARY KEY IDENTITY(1,1),
	Input NVARCHAR(MAX),
	Output NVARCHAR(MAX),
	MaCH INT
)

CREATE TABLE Admin_SQLSubmitHistory (
	MaSubmit INT PRIMARY KEY IDENTITY(1,1),
	Username NVARCHAR(50),
	MaCH INT,
	SQLQuery NVARCHAR(MAX),
	KetQua NVARCHAR(MAX),
	ThoiGian DATETIME
)


SELECT CH.MaCH, KQ.KetQua, CH.MucDo, CH.TieuDe, CH.LuocDo
            FROM (SELECT DISTINCT LS.MaCH, LS.Username, LS.KetQua
                FROM Admin_SQLSubmitHistory LS
                WHERE LS.KetQua = N'100' AND LS.Username = N'pzcuong') KQ RIGHT JOIN Admin_CauHoi CH ON CH.MaCH = KQ.MaCH
            WHERE CH.TinhTrang = 1

SELECT * FROM dbo.Admin_CauHoi
DELETE FROM dbo.Admin_CauHoi WHERE TieuDe = N'Bài tập thực hành'