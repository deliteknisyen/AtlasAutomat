// Klasör: src/middleware
// Dosya: errorHandler.js

const { logError } = require('../utils/logger');

/**
 * Global hata yakalama middleware'i
 * Tüm hataları yakalar ve uygun HTTP yanıtı döner.
 * @param {Error} err - Yakalanan hata objesi
 * @param {Request} req - Express request objesi
 * @param {Response} res - Express response objesi
 * @param {Function} next - Express next middleware fonksiyonu
 */
function errorHandler(err, req, res, next) {
    // Hata mesajını ve stack trace'i logluyoruz
    logError(`Global hata: ${err.message}`);
    if (err.stack) {
        logError(err.stack);
    }

    // HTTP statüsünü belirleyin. Eğer belirtilmemişse 500 (Internal Server Error) döndürülür.
    const statusCode = err.statusCode || 500;

    // Hata mesajını döndürün
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Sunucu hatası oluştu',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack, // Production modda stack trace'i gizleyin
    });
}

module.exports = errorHandler;
