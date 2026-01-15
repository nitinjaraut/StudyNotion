const nodemailer = require('nodemailer');
require("dotenv").config()

const mailSender = async (email,title,body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"Study Notion" <${process.env.MAIL_USER}>`, // sender address
            to: `${email}`, // list of receivers
            subject: `${title}`, 
            html: `${body}`, // html content as it is formatted into user mail
        });

        console.log('Message sent: ', info);
        return info;

    }
    catch (error) {
        console.log(error.message);
        console.error('Error sending email:', error);
    }
}
module.exports = mailSender;
