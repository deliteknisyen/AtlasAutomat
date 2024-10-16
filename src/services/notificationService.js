// Klasör: src/services
// Dosya: notificationService.js

const nodemailer = require('nodemailer');
const { logMessage, logError } = require('../utils/logger');

/**
 * sendNotification - E-posta ile bildirim gönderir
 * @param {Object} options - Bildirim seçenekleri (to, subject, text)
 * @returns {Promise<void>}
 */
async function sendNotification({ to, subject, text }) {
    // E-posta gönderici bilgilerini tanımlayın
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Gmail üzerinden gönderim yapılacak
        auth: {
            user: process.env.EMAIL_USER, // .env dosyasından e-posta adresi
            pass: process.env.EMAIL_PASS, // .env dosyasından e-posta şifresi
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        // E-posta gönderme işlemi
        await transporter.sendMail(mailOptions);
        logMessage(`E-posta gönderildi: ${to}, Konu: ${subject}`);
    } catch (error) {
        logError(`E-posta gönderimi sırasında hata oluştu: ${error.message}`);
    }
}

module.exports = {
    sendNotification,
};
