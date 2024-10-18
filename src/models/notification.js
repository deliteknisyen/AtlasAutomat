// Klasör: src/models
// Dosya: notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    personnelId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterPersonnel', required: true }, // Bildirimi alan personel
    message: { type: String, required: true }, // Bildirim mesajı
    type: {
        type: String,
        enum: ['machine_status', 'stock_alert', 'task_assigned'], // Bildirim tipi: makine durumu, stok uyarısı, görev ataması
        required: true
    },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: false }, // İlgili makine (opsiyonel)
    reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: false }, // İlgili makara (opsiyonel)
    read: { type: Boolean, default: false }, // Bildirim okundu mu?
    createdAt: { type: Date, default: Date.now }, // Bildirimin oluşturulma zamanı
});

module.exports = mongoose.model('Notification', notificationSchema);
