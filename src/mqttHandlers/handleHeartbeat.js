// Klasör: src/mqttHandlers
// Dosya: handleHeartbeat.js

const Machine = require('../models/machines'); // Machine modelini dahil ediyoruz
const { logMessage, logError } = require('../utils/logger'); // Loglama fonksiyonlarını dahil ediyoruz
const { getMqttClient } = require('../mqttHandler'); // MQTT client'ı mqttHandler'dan alıyoruz
const { formatDate } = require('../utils/dateFormatter'); // Tarih formatlama fonksiyonu

/**
 * handleHeartbeatMessage - Makine heartbeat mesajlarını işler ve makinenin durumunu günceller
 * @param {Object} parsedMessage - MQTT ile gelen heartbeat mesajı, JSON formatında
 */
async function handleHeartbeatMessage(parsedMessage) {
    const { serialNumber, status } = parsedMessage; // MQTT'den gelen veri
    const client = getMqttClient(); // MQTT client'ı alıyoruz

    // MQTT Client kontrolü
    if (!client) {
        logError('MQTT Client mevcut değil');
        return;
    }

    // Seri numarası ve durum kontrolü
    if (!serialNumber || !status) {
        logError(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`);
        client.publish('machines/error', JSON.stringify({ status: 'failed', message: 'Geçersiz veri' }));
        return;
    }

    try {
        // Veritabanından makineyi bul
        const machine = await Machine.findOne({ serialNumber });
        if (!machine) {
            logError(`Makine bulunamadı: Seri Numarası - ${serialNumber}`);
            client.publish('machines/error', JSON.stringify({ status: 'failed', message: 'Makine bulunamadı' }));
            return;
        }

        // Makinenin son durumunu ve heartbeat zamanını güncelle
        machine.status = status;
        machine.lastHeartbeat = new Date(); // Son heartbeat zamanını güncelle
        await machine.save(); // Veritabanına kaydet

        const formattedHeartbeat = formatDate(machine.lastHeartbeat); // lastHeartbeat tarihini formatla
        logMessage(`Makine durumu güncellendi: Seri Numarası - ${serialNumber}, Durum - ${status}, Son Heartbeat: ${formattedHeartbeat}`);

        // Başarılı yanıt gönder
        client.publish('machines/heartbeat/response', JSON.stringify({
            serialNumber,
            status: 'updated',
            lastHeartbeat: formattedHeartbeat // Formatlanmış son heartbeat
        }));

    } catch (error) {
        logError(`Makine durumu işlenirken hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = handleHeartbeatMessage;
