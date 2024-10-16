// Klasör: src/models
// Dosya: masterCompany.js

const mongoose = require('mongoose');

const masterCompanySchema = new mongoose.Schema({
    name: { type: String, required: true }, // Firma adı
    email: { type: String, required: true, unique: true }, // E-posta adresi
    phone: { type: String, required: true }, // Telefon numarası
    address: { type: String, required: true }, // Adres
    personnel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MasterPersonnel' }], // Firma ile ilişkili personeller
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MasterCompany', masterCompanySchema);
