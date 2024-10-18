// Klasör: src/models
// Dosya: machines.js

const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true, unique: true }, // Makine seri numarası
    model: { type: String, required: false }, // Makine modeli
    description: { type: String, required: false }, // Kısa açıklama
    department: { type: String, required: false }, // Bağlı olduğu departman
    createdAt: { type: Date, default: Date.now }, // Makinenin oluşturulma tarihi
    updatedAt: { type: Date, default: Date.now }, // Makine kaydının son güncellenme tarihi
    isActive: { type: Boolean, required: true, default: false }, // Makine aktif mi değil mi
    token: { type: String, required: false }, // Token, opsiyonel
    status: {
        type: String,
        enum: ['online', 'offline', 'faulty', 'unregistered', 'pending', 'maintenance_due', 'needs_service'], // Durum seçenekleri genişletildi
        required: true,
        default: 'unregistered' // Varsayılan durum 'unregistered'
    },
    lastHeartbeat: { type: Date, required: false }, // Son heartbeat zamanı
    reels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }], // Makineye bağlı makaralar
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // İlişkili şirket
    assignedTechnicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterPersonnel', required: false }, // Atanmış teknisyen
    location: { type: String, required: false }, // Makinenin bulunduğu lokasyon (eklenebilir)
    lastServiceDate: { type: Date, required: false }, // Son servis tarihi
    nextMaintenanceDue: { type: Date, required: false }, // Sonraki bakım tarihi
});

// `updatedAt` alanını otomatik olarak günceller
machineSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Machine', machineSchema);








