// Klasör: src/utils
// Dosya: sendEmail.js

const nodemailer = require('nodemailer');
const { logError, logMessage } = require('./logger');

// E-posta gönderme işlevi
async function sendEmail({ to, subject, text, html }) {
    // Nodemailer ile e-posta ayarları
    const transporter = nodemailer.createTransport({
        host: 'smtp.example.com', // SMTP sunucusunu belirtin
        port: 587, // SMTP portunu belirtin (TLS kullanıyorsanız genelde 587)
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'your-email@example.com', // E-posta adresiniz
            pass: 'your-email-password', // E-posta şifreniz
        },
    });

    // Gönderilecek e-posta bilgileri
    const mailOptions = {
        from: '"Atlas Otomat" <your-email@example.com>', // Gönderen adı ve e-posta adresi
        to, // Alıcı e-posta adresi
        subject, // E-posta konusu
        text, // E-posta içeriği (düz metin)
        html, // E-posta içeriği (HTML formatı)
    };

    // E-posta gönderme işlemi
    try {
        const info = await transporter.sendMail(mailOptions);
        logMessage(`E-posta başarıyla gönderildi: ${info.messageId}`);
        return info;
    } catch (error) {
        logError(`E-posta gönderme hatası: ${error.message}`);
        throw error;
    }
}

module.exports = sendEmail;
