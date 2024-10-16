// Klasör: src/utils
// Dosya: notificationService.js

const nodemailer = require('nodemailer');
const Notification = require('../models/notification');
const logMessage = require('../utils/logMessage');


// E-posta gönderimi için yapılandırma
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Alternatif olarak başka bir e-posta servisi kullanılabilir
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // E-posta kullanıcı adı
        pass: process.env.EMAIL_PASS || 'your-password', // E-posta şifresi
    },
});

// E-posta gönderme fonksiyonu
async function sendEmail({ to, subject, text }) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        logMessage(`E-posta başarıyla gönderildi: ${to}`);
    } catch (error) {
        logMessage(`E-posta gönderimi sırasında hata oluştu: ${error.message}`);
    }
}

// Bildirim kaydetme fonksiyonu (veritabanına kaydediyoruz)
async function createNotification({ machineId, message }) {
    try {
        const notification = new Notification({
            machineId,
            message,
            timestamp: new Date(),
        });

        await notification.save();
        logMessage(`Bildirim kaydedildi: ${message}`);
    } catch (error) {
        logMessage(`Bildirim kaydı sırasında hata oluştu: ${error.message}`);
    }
}

// Genel bildirim gönderme (hem veritabanına kaydediyor hem de e-posta gönderiyor)
async function sendNotification({ to, subject, text, machineId, message }) {
    // E-posta gönder
    await sendEmail({ to, subject, text });

    // Bildirimi kaydet
    await createNotification({ machineId, message });
}

module.exports = {
    sendEmail,
    createNotification,
    sendNotification,
};
