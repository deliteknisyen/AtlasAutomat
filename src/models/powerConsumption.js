// Klasör: src/models
// Dosya: powerConsumption.js

const mongoose = require('mongoose');

const powerConsumptionSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true }, // Otomatın seri numarası
    voltage: { type: Number, required: true },      // Voltaj
    current: { type: Number, required: true },      // Akım
    power: { type: Number, required: true },        // Güç (Watt)
    energy: { type: Number, required: true },       // Tüketilen enerji (kWh)
    timestamp: { type: Date, default: Date.now }    // Ölçüm zamanı
});

module.exports = mongoose.model('PowerConsumption', powerConsumptionSchema);
