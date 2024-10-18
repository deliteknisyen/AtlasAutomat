// Klasör: src/models
// Dosya: task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true }, // Makine ID
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterPersonnel', required: true }, // Görev verilen teknisyen
    description: { type: String, required: true }, // Görev açıklaması
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' }, // Görev durumu
    createdAt: { type: Date, default: Date.now }, // Görev oluşturulma zamanı
    dueDate: { type: Date, required: true }, // Görev tamamlanma tarihi
    completedAt: { type: Date }, // Görev tamamlanma tarihi
});

module.exports = mongoose.model('Task', taskSchema);
