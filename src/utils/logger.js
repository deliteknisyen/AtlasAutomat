// Klasör: src/utils
// Dosya: logger.js

const fs = require('fs');
const path = require('path');

// Log dosyasının yolu
const logFilePath = path.join(__dirname, '../logs', 'app.log');

// Loglama fonksiyonu
function logMessage(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(logEntry); // Konsola yazdır
    fs.appendFileSync(logFilePath, logEntry, 'utf8'); // Log dosyasına yaz
}

// Hatalar için özel loglama fonksiyonu
function logError(errorMessage) {
    const errorEntry = `[${new Date().toISOString()}] ERROR: ${errorMessage}\n`;
    console.error(errorEntry); // Konsola yazdır
    fs.appendFileSync(logFilePath, errorEntry, 'utf8'); // Log dosyasına yaz
}

// Özel uyarı loglama fonksiyonu
function logWarning(warningMessage) {
    const warningEntry = `[${new Date().toISOString()}] WARNING: ${warningMessage}\n`;
    console.warn(warningEntry); // Konsola yazdır
    fs.appendFileSync(logFilePath, warningEntry, 'utf8'); // Log dosyasına yaz
}

module.exports = {
    logMessage,
    logError,
    logWarning,
};

