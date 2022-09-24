const nodemailer = require("nodemailer");
var pug = require('pug');

require('dotenv').config();

async function GuiMailDangKyPV(receivers, subject, position) {
  let transporter = nodemailer.createTransport({
    host: "smtp.porkbun.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EmailAccount, // generated ethereal user
      pass: process.env.EmailPassword, // generated ethereal password
    },
  });

  let html = pug.renderFile('public/email/index.pug', {position: position});

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
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

exports.GuiMailDangKyPV = GuiMailDangKyPV;
