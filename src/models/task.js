// Klasör: src/models
// Dosya: task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Personel', required: true }, // Teknik servis personeli
    description: { type: String, required: true }, // Görev açıklaması
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' }, // Görev durumu
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true }, // Görevin tamamlanması gereken tarih
});

module.exports = mongoose.model('Task', taskSchema);
