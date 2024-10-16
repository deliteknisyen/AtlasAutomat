// Klasör: src/mqttHandlers
// Dosya: handleRegister.js

const Machine = require('../models/machines');
const { logMessage, logError } = require('../utils/logger');
const { getMqttClient } = require('../mqttHandler'); // MQTT client'ı alıyoruz
const crypto = require('crypto'); // Token oluşturmak için kullanılacak

/**
 * handleRegister - Makine kayıt işlemini yönetir
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleRegister(parsedMessage) {
    const { serialNumber } = parsedMessage;
    const client = getMqttClient(); // MQTT client'ı alıyoruz

    // MQTT Client kontrolü
    if (!client) {
        logError('MQTT Client mevcut değil');
        return;
    }

    // Seri numarası kontrolü
    if (!serialNumber) {
        logError(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`);
        client.publish('machines/error', JSON.stringify({ status: 'failed', message: 'Geçersiz seri numarası' }));
        return;
    }

    try {
        // Makineyi bul veya yeni makine oluştur
        let machine = await Machine.findOne({ serialNumber });
        if (!machine) {
            // Yeni bir makine oluştur ve kaydet
            machine = new Machine({ serialNumber, status: 'unregistered', token: '' });
            await machine.save();
            logMessage(`Yeni makine kaydedildi: Seri Numarası - ${serialNumber}`);
        } else {
            logMessage(`Makine kayıtlı: ${serialNumber}`);
        }

        // Token oluşturma
        const newToken = `token_${serialNumber}_${Date.now()}`;
        machine.token = newToken; // Makineye token'ı ekliyoruz
        await machine.save(); // Veritabanına kaydediyoruz

        logMessage(`Makine kayıtlı: ${serialNumber}, Token oluşturuldu`);

        // MQTT yanıtı
        client.publish('machines/register/response', JSON.stringify({
            serialNumber: machine.serialNumber,
            status: 'success',
            message: 'Makine kaydı tamamlandı',
            token: newToken, // Token'ı yanıt olarak gönderiyoruz
        }));

    } catch (error) {
        logError(`Makine kaydı sırasında hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = handleRegister;
