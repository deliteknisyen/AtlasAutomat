// Klasör: src/models
// Dosya: masterPersonnel.js

const mongoose = require('mongoose');

const masterPersonnelSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Personel adı
    email: { type: String, required: true, unique: true }, // E-posta adresi
    phone: { type: String, required: true }, // Telefon numarası
    role: { type: String, enum: ['admin', 'technician'], default: 'technician' }, // Rol (admin veya technician)
    createdAt: { type: Date, default: Date.now },
    masterCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterCompany', required: true } // Hangi firmaya bağlı
});

module.exports = mongoose.model('MasterPersonnel', masterPersonnelSchema);
