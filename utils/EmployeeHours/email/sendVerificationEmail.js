const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    auth: {
        user: process.env.EMAIL_ADD, // your Outlook email
        pass: process.env.EMAIL_APP_PWD // generated app password
    }
});

exports.sendVerificationEmail = async ({sendTo, subject, htmlContent, plaintText}) => {
    try {
        console.log(sendTo, subject, htmlContent, plaintText)
        let info = await transporter.sendMail({
            from: '"Marler IT Support" <it.support@marlerintegrity.com>', // sender address
            to: sendTo, // recipient address
            subject: subject, // email subject
            text: plaintText, // fallback plain text
            html: htmlContent // html body
        });

        return true;
    } catch (error) {
        throw error;
    }
}
