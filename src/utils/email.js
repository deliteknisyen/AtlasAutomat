// Klasör: src/utils
// Dosya: email.js

const nodemailer = require('nodemailer');
const logMessage = require('./logMessage');

// E-posta gönderimi için yapılandırma
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Başka bir e-posta servisi kullanılabilir
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Gmail kullanıcı adı
        pass: process.env.EMAIL_PASS || 'your-password', // Gmail şifresi
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

module.exports = {
    sendEmail,
};
