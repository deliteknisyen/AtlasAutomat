// Klasör: src/utils
// Dosya: errorHandler.js

const logMessage = require('./logMessage');

// Genel hata işleyici middleware
function errorHandler(err, req, res, next) {
    // Hata detaylarını logluyoruz
    logMessage(`Hata: ${err.message}`);

    // İstek ve hata detaylarını loglayalım
    console.error('Hata Detayları:', {
        message: err.message,
        stack: err.stack,
        reqMethod: req.method,
        reqPath: req.path,
        reqBody: req.body,
    });

    // Hata yanıtını gönderelim
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Sunucu Hatası',
    });
}

// Asenkron işlevlerde hata yakalamak için yardımcı işlev
function catchAsyncErrors(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    catchAsyncErrors,
};
