// Klasör: src/utils
// Dosya: sendEmail.js

const nodemailer = require('nodemailer');
const { logError, logMessage } = require('./logger');

// E-posta gönderme işlevi
async function sendEmail({ to, subject, text, html }) {
    // Nodemailer ile e-posta ayarları
    const transporter = nodemailer.createTransport({
        host: 'mail.lazercrm.com', // SMTP sunucusunu belirtin
        port: 587, // SMTP portunu belirtin (TLS kullanıyorsanız genelde 587)
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'crm@lazercrm.com', // Kimlik doğrulaması için e-posta adresiniz
            pass: 'ZClk95V1', // E-posta şifreniz
        },
        tls: {
            minVersion: 'TLSv1.2', // En az TLSv1.2 kullanarak güvenliği artırın
            rejectUnauthorized: false // SSL sertifikası doğrulamasını devre dışı bırakın (gerekli ise)
        }
    });

    // Gönderilecek e-posta bilgileri
    const mailOptions = {
        from: '"Atlas Otomat" <crm@lazercrm.com>', // Gönderen adresi ve adı (auth.user ile aynı olmalı)
        to, // Alıcı e-posta adresi
        subject, // E-posta konusu
        text, // E-posta içeriği (düz metin)
        html, // E-posta içeriği (HTML formatı), eğer sağlanmışsa
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
