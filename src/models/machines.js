const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true, unique: true },
    model: { type: String, required: false },
    description: { type: String, required: false },
    department: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, required: true, default: false },
    token: { type: String, required: false }, // Token zorunlu değil
    status: {
        type: String,
        enum: ['online', 'offline', 'faulty', 'unregistered', 'pending'],
        required: true,
        default: 'unregistered'
    },
    lastHeartbeat: { type: Date, required: false },
    reels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }], // Makineye ait makaralar
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' } // İlişkilendirilmiş şirket
});

// updatedAt alanını otomatik olarak güncelle
machineSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Machine', machineSchema);
