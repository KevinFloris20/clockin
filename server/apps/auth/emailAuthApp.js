const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'cred.env' });
const senderEmail = process.env.SENDER_EMAIL;
const senderEmailPassword = process.env.SENDER_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: senderEmail,
        pass: senderEmailPassword
    }
});

const sendLoginEmail = (email, link) => {
    const mailOptions = {
        from: senderEmail,
        to: email,
        subject: 'Login to Your Clock-in App Account',
        text: `Click this link to login: ${link}`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendLoginEmail };
