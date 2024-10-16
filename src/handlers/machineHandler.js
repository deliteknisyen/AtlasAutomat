// Klasör: src/handlers
// Dosya: machineHandler.js

const Machine = require('../models/machines');
const Notification = require('../models/notification');

const { logMessage, logError, logWarning } = require('../utils/logger');
const sendEmail = require('../utils/email');
const client = require('../mqttHandler').client;

/**
 * handleMachineRegister - Makine kayıt işlemini yönetir
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleMachineRegister(parsedMessage) {
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

/**
 * handleHeartbeatMessage - Makinenin heartbeat (durum) mesajını işler
 * @param {Object} parsedMessage - MQTT ile gelen heartbeat mesajı
 */
async function handleHeartbeatMessage(parsedMessage) {
    const { serialNumber, status } = parsedMessage;

    // Seri numarası ve durum kontrolü
    if (!serialNumber || !status) {
        logMessage(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`, 'error');
        client.publish('machines/error', JSON.stringify({ status: 'failed', message: 'Geçersiz veri' }));
        return;
    }

    try {
        // Makineyi bul
        const machine = await Machine.findOne({ serialNumber });
        if (!machine) {
            logMessage(`Makine bulunamadı: Seri Numarası - ${serialNumber}`, 'error');
            client.publish('machines/error', JSON.stringify({ status: 'failed', message: 'Makine bulunamadı' }));
            return;
        }

        // Makinenin durumunu güncelle
        machine.status = status;
        machine.lastHeartbeat = new Date();
        await machine.save();

        logMessage(`Makine durumu güncellendi: Seri Numarası - ${serialNumber}, Durum - ${status}`, 'info');

        // Eğer makine 'offline' veya 'faulty' duruma geçerse bildirim ve e-posta gönder
        if (status === 'offline' || status === 'faulty') {
            await Notification.create({
                machineId: machine._id,
                message: `Makine ${serialNumber} ${status} durumuna geçti.`,
                timestamp: new Date(),
            });

            // Teknik personele e-posta bildirimi gönder
            await sendEmail({
                to: 'teknik@atlasotomasyon.com',
                subject: `Makine ${serialNumber} durumu: ${status}`,
                text: `Makine ${serialNumber} ${status} durumuna geçti. Lütfen kontrol edin.`,
            });

            logMessage(`Uyarı ve e-posta gönderildi: Makine - ${serialNumber}, Durum - ${status}`, 'warning');
        }

        // Başarılı yanıt gönder
        client.publish('machines/heartbeat/response', JSON.stringify({
            serialNumber,
            status: 'updated',
        }));

    } catch (error) {
        logMessage(`Makine durumu işlenirken hata oluştu: ${error.message}`, 'error');
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = {
    handleMachineRegister,
    handleHeartbeatMessage,
};
