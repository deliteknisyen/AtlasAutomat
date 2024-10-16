// Klasör: src/mqttHandlers
// Dosya: handleRegister.js

const { client } = require('../mqttHandler');  // mqttClient yerine mqttHandler kullanılıyor
const Machine = require('../models/machines');
const { logMessage, logError, logWarning } = require('../utils/logger');

/**
 * handleRegister - Makine kayıt işlemini yönetir
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleRegister(parsedMessage) {
    const { serialNumber } = parsedMessage;

    // Seri numarası kontrolü
    if (!serialNumber) {
        logMessage(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`, 'error');
        client.publish('machines/error', JSON.stringify({ status: 'failed', message: 'Geçersiz seri numarası' }));
        return;
    }

    try {
        // Makineyi bul veya yeni makine oluştur
        let machine = await Machine.findOne({ serialNumber });
        if (!machine) {
            machine = new Machine({ serialNumber, status: 'unregistered' });
            await machine.save();
            logMessage(`Yeni makine kaydedildi: Seri Numarası - ${serialNumber}`, 'info');
        } else {
            logMessage(`Makine zaten kayıtlı: Seri Numarası - ${serialNumber}`, 'info');
        }

        // MQTT yanıtı
        client.publish('machines/register/response', JSON.stringify({
            serialNumber: machine.serialNumber,
            status: 'success',
            message: 'Makine kaydı tamamlandı',
        }));

    } catch (error) {
        logMessage(`Makine kaydı sırasında hata oluştu: ${error.message}`, 'error');
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = handleRegister;
