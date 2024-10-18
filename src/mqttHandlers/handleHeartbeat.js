// Klasör: src/mqttHandlers
// Dosya: handleHeartbeat.js

const Machine = require('../models/machines'); // Machine modelini dahil ediyoruz
const Notification = require('../models/notification'); // Bildirim modeli
const Task = require('../models/task'); // Görev modeli
const { logMessage, logError } = require('../utils/logger'); // Loglama fonksiyonlarını dahil ediyoruz
const { getMqttClient } = require('../mqttHandler'); // MQTT client'ı mqttHandler'dan alıyoruz
const { formatDate } = require('../utils/dateFormatter'); // Tarih formatlama fonksiyonu
const sendEmail = require('../utils/sendEmail'); // E-posta gönderim fonksiyonu

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

        // Eğer makine 'offline' veya 'faulty' duruma geçerse bildirim, e-posta ve görev oluştur
        if (status === 'offline' || status === 'faulty') {
            // Teknisyene bildirim oluştur
            if (machine.assignedTechnicianId) {
                await Notification.create({
                    personnelId: machine.assignedTechnicianId, // Atanan teknisyene bildirim gönder
                    machineId: machine._id,
                    message: `Makine ${machine.serialNumber} ${status} duruma geçti.`,
                    type: 'machine_status',
                });

                // Teknik ekibe e-posta gönder
                await sendEmail({
                    to: 'plusthemurat@gmail.com', // Teknisyene e-posta gönderiliyor
                    subject: `Makine ${machine.serialNumber} durumu: ${status}`,
                    text: `Makine ${machine.serialNumber} ${status} duruma geçti. Lütfen kontrol edin.`,
                });

                // Görev oluştur
                await Task.create({
                    machineId: machine._id,
                    technicianId: machine.assignedTechnicianId, // Teknisyene görev atandı
                    description: `Makine ${serialNumber} ${status} duruma geçti. Kontrol ve bakım yapın.`,
                    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 24 saat içinde tamamlanmalı
                });

                logMessage(`Makine ${machine.serialNumber} ${status}, görev oluşturuldu ve teknisyene bildirim gönderildi.`);
            } else {
                logError(`Makine ${serialNumber} için atanmış teknisyen bulunamadı.`);
            }
        }

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
