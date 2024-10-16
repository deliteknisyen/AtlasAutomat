// Klasör: src/models
// Dosya: personel.js

const mongoose = require('mongoose');

const personelSchema = new mongoose.Schema({

    TCKN: { type: String, required: true, unique: true },
    kartID: { type: String, required: true, unique: true },
    ad: { type: String, required: true },
    soyad: { type: String, required: true },
    telefon: { type: String, required: false },
    eposta: { type: String, required: false },
    dogumTarihi: { type: Date, required: false },
    cinsiyet: { type: String, required: false },
    adres: { type: String, required: false },
    il: { type: String, required: false },
    ilce: { type: String, required: false },
    semt: { type: String, required: false },
    company: [{ type: mongoose.Schema.Types.ObjectId, ref: 'company' }],
    isActive: { type: Boolean, required: true },
    urunSatisHakki: { type: Boolean, required: true },
    urunAlmaHakki: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Personel', personelSchema);
