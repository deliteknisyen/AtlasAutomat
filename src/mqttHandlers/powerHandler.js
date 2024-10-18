// Klasör: src/mqttHandlers
// Dosya: powerHandler.js

const PowerConsumption = require('../models/powerConsumption');
const { logMessage, logError } = require('../utils/logger');


/**
 * handlePowerMessage - Elektrik tüketim mesajlarını işler
 * @param {Object} parsedMessage - MQTT'den gelen mesaj (JSON formatında)
 */
    async function handlePowerMessage(parsedMessage) {
    const { serialNumber, voltage, current, power, energy } = parsedMessage;


    // MQTT Client kontrolü
    if (!client) {
        logError('MQTT Client mevcut değil');
        return;
    }

    // Verilerin doğruluğunu kontrol et
    if (!serialNumber || voltage === undefined || current === undefined || power === undefined || energy === undefined) {
        logError('Geçersiz elektrik verisi', parsedMessage);
        return;
    }

    try {
        // Verileri veritabanına kaydet
        const newEntry = new PowerConsumption({
            serialNumber,
            voltage,
            current,
            power,
            energy
        });

        await newEntry.save();
        logMessage(`Elektrik verisi kaydedildi: Seri No - ${serialNumber}`);

    } catch (error) {
        logError(`Elektrik verisi kaydedilirken hata oluştu: ${error.message}`);
    }
}

module.exports = handlePowerMessage;
