const nodemailer = require("nodemailer");
var pug = require('pug');

require('dotenv').config();

async function GuiMailDangKyPV(receivers, subject, position, name) {
  try {
    console.log("GuiMailDangKyPV");
    let transporter = nodemailer.createTransport({
      host: "smtp.porkbun.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EmailAccount, // generated ethereal user
        pass: process.env.EmailPassword, // generated ethereal password
      },
    });
  
    let html = pug.renderFile('public/email/index.pug', {position: position, name: name});
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Thông báo từ Ban Học Tập" <notice@banhoctap.dev>', // sender address
      to: `20521150@gm.uit.edu.vn, ${receivers}` , // list of receivers
      subject: subject, // Subject line
      html: html, // html body
      attachments: [
        {
          filename: 'logo.png',
          path: 'public/email/images/image-3.png',
          cid: 'logo'
        },
        {
          filename: 'image-1.png',
          path: 'public/email/images/image-1.png',
          cid: 'image-1'
        },
        {
          filename: 'image-2.png',
          path: 'public/email/images/image-2.png',
          cid: 'image-2'
        },
      ]
    });
  
    console.log("Message sent: %s", info.messageId);
    return ({
      success: true,
      message: "Gửi mail thành công"
    })
  } catch (error) {
    console.log(error);
    return ({
      success: false,
      message: "Gửi mail thất bại"
    })
  }
}

exports.GuiMailDangKyPV = GuiMailDangKyPV;
