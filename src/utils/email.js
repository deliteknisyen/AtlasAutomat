// Klasör: src/utils
// Dosya: email.js

const nodemailer = require('nodemailer');
const { logMessage, logError } = require('./logger');

/**
 * sendEmail - E-posta gönderme fonksiyonu
 * @param {Object} mailOptions - Gönderilecek e-posta ayarları (to, subject, text, html)
 * @returns {Promise<void>}
 */
async function sendEmail(mailOptions) {
    // Nodemailer için transporter ayarları
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Gmail üzerinden gönderim yapılacak
        auth: {
            user: process.env.EMAIL_USER, // Gönderici e-posta adresi (env dosyasından alınır)
            pass: process.env.EMAIL_PASS, // Gönderici e-posta şifresi (env dosyasından alınır)
        },
    });

    // Varsayılan gönderici e-posta adresini mailOptions içine dahil ediyoruz
    mailOptions.from = process.env.EMAIL_USER;

    try {
        // E-posta gönderimi
        await transporter.sendMail(mailOptions);
        logMessage(`E-posta başarıyla gönderildi: ${mailOptions.to}, Konu: ${mailOptions.subject}`);
    } catch (error) {
        logError(`E-posta gönderim hatası: ${error.message}`);
    }
}

module.exports = sendEmail;
