// Klasör: src/utils
// Dosya: logger.js

const fs = require('fs');
const path = require('path');

// Log dosyasının yolu
const logFilePath = path.join(__dirname, '../logs', 'app.log');

// Log dosyasına yazma fonksiyonu
function writeLogToFile(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8'); // Logları dosyaya yaz
}

// Genel loglama fonksiyonu
function logMessage(message, level = 'info') {
    const logEntry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    console.log(logEntry); // Konsola yazdır
    writeLogToFile(logEntry); // Log dosyasına yazdır
}

// Hatalar için loglama fonksiyonu
function logError(errorMessage) {
    logMessage(`ERROR: ${errorMessage}`, 'error');
}

// Uyarılar için loglama fonksiyonu
function logWarning(warningMessage) {
    logMessage(`WARNING: ${warningMessage}`, 'warning');
}

// Başarı veya bilgilendirme mesajları için loglama fonksiyonu
function logInfo(infoMessage) {
    logMessage(infoMessage, 'info');
}

module.exports = {
    logMessage,
    logError,
    logWarning,
    logInfo,
};
