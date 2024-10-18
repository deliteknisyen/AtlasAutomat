// Klasör: src/utils
// Dosya: heartbeatMonitor.js

const Machine = require('../models/machines');
const Notification = require('../models/notification');
const Task = require('../models/task'); // Görev modelini dahil ediyoruz
const { logMessage, logError } = require('./logger');
const sendEmail = require('./sendEmail');

// Offline kontrol aralığı (milisaniye cinsinden), örneğin 1 dakika
const OFFLINE_THRESHOLD = 1 * 60 * 1000;

async function monitorMachinesForOfflineStatus() {
    try {
        const machines = await Machine.find({});

        const now = Date.now();
        for (const machine of machines) {
            const timeSinceLastHeartbeat = now - new Date(machine.lastHeartbeat).getTime();

            if (timeSinceLastHeartbeat > OFFLINE_THRESHOLD && machine.status !== 'offline') {
                // Makine offline oldu
                machine.status = 'offline';
                await machine.save();

                // Bildirim oluştur
                await Notification.create({
                    personnelId: machine.assignedTechnicianId, // Atanmış teknisyene bildirim
                    machineId: machine._id,
                    message: `Makine ${machine.serialNumber} offline duruma geçti.`,
                    type: 'machine_status',
                });

                // Teknik ekibe e-posta gönder
                await sendEmail({
                    to: 'plusthemurat@gmail.com', // Teknisyene e-posta
                    subject: `Makine ${machine.serialNumber} offline oldu`,
                    text: `Makine ${machine.serialNumber} belirli bir süre boyunca heartbeat mesajı göndermedi ve offline oldu. Lütfen kontrol edin.`,
                });

                // Görev oluştur
                await Task.create({
                    machineId: machine._id,
                    technicianId: machine.assignedTechnicianId, // Teknisyene görev atandı
                    description: `Makine ${machine.serialNumber} offline duruma geçti. Kontrol ve bakım yapın.`,
                    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 24 saat içinde tamamlanmalı
                });

                logMessage(`Makine ${machine.serialNumber} offline oldu, teknisyen bilgilendirildi ve görev oluşturuldu.`);
            }
        }
    } catch (error) {
        logError(`Makine durumu kontrol edilirken hata oluştu: ${error.message}`);
    }
}

module.exports = {
    monitorMachinesForOfflineStatus,
};
