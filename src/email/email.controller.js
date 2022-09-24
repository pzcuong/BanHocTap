const nodemailer = require("nodemailer");
require('dotenv').config();

async function main() {
  let transporter = nodemailer.createTransport({
    host: "smtp.porkbun.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EmailAccount, // generated ethereal user
      pass: process.env.EmailPassword, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Thông báo WeQuery" <notice@wequery.app>', // sender address
    to: "20521150@gm.uit.edu.vn, pzcuonguit@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

