// Klasör: src/utils
// Dosya: sendEmail.js

const nodemailer = require('nodemailer');

// E-posta gönderim fonksiyonu
async function sendEmail({ to, subject, text, html }) {
    try {
        // E-posta gönderici ayarları
        let transporter = nodemailer.createTransport({
            service: 'gmail', // veya smtp sunucusu
            auth: {
                user: process.env.EMAIL_USER, // .env dosyasından çekiliyor
                pass: process.env.EMAIL_PASS, // .env dosyasından çekiliyor
            },
        });

        // E-posta içerik ayarları
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        };

        // E-posta gönderimi
        let info = await transporter.sendMail(mailOptions);

        console.log('E-posta gönderildi: %s', info.messageId);
    } catch (error) {
        console.error('E-posta gönderim hatası: ', error);
    }
}

module.exports = sendEmail;
