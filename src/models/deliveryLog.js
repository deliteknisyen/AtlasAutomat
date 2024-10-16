// Klasör: src/models
// Dosya: deliveryLog.js

const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema({
    reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true }, // Hangi makara
    compartmentNumber: { type: Number, required: true }, // Hangi compartment
    cardId: { type: String, required: true }, // Kart ID'si
    timestamp: { type: Date, default: Date.now }, // Teslimat zamanı
});

module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);
