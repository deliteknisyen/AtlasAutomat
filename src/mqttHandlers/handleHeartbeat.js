// Klasör: src/mqttHandlers
// Dosya: handleHeartbeat.js

const { client } = require('../mqttHandler');  // mqttClient yerine mqttHandler kullanılıyor
const Machine = require('../models/machines');
const { logMessage, logError, logWarning } = require('../utils/logger');
const Notification = require('../models/notification');
const { sendEmail } = require('../utils/email');

/**
 * handleHeartbeatMessage - Makine heartbeat mesajlarını işler ve makinenin durumunu günceller
 * @param {Object} parsedMessage - MQTT ile gelen heartbeat mesajı, JSON formatında
 */
async function handleHeartbeatMessage(parsedMessage) {
    const { serialNumber, status } = parsedMessage;

    // Makine seri numarası ve durumu kontrol ediliyor
    if (!serialNumber || !status) {
        logMessage(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`);
        return;
    }

    try {
        // Makineyi veritabanında bul
        const machine = await Machine.findOne({ serialNumber });
        if (!machine) {
            logMessage(`Makine bulunamadı: Seri Numarası - ${serialNumber}`);
            return;
        }

        // Makinenin durumunu güncelle
        machine.status = status;
        machine.lastHeartbeat = new Date();
        await machine.save();

        logMessage(`Makine durumu güncellendi: Seri Numarası - ${serialNumber}, Durum - ${status}`);

        // Eğer makine 'offline' veya 'faulty' duruma geçerse teknik personele bildirim gönder
        if (status === 'offline' || status === 'faulty') {
            // Bildirim oluştur
            await Notification.create({
                machineId: machine._id,
                message: `Makine ${serialNumber} ${status} durumuna geçti.`,
                timestamp: new Date(),
            });

            // E-posta ile uyarı gönder
            sendEmail({
                to: "teknik@atlasotomasyon.com",
                subject: `Makine ${serialNumber} durumu: ${status}`,
                text: `Makine ${serialNumber}, ${status} durumuna geçti. Lütfen kontrol edin.`,
            });
        }

    } catch (error) {
        logMessage(`Makine durumu işlenirken hata oluştu: ${error.message}`);
    }
}

module.exports = {
    handleHeartbeatMessage,
};
