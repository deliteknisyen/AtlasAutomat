// Klasör: src/models
// Dosya: salesLog.js

const mongoose = require('mongoose');

const salesLogSchema = new mongoose.Schema({
    reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true }, // Hangi makara
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Hangi ürün
    compartmentNumber: { type: Number, required: true }, // Hangi compartment
    cardId: { type: String, required: true }, // Kart ID'si (RFID)
    salePrice: { type: Number, required: true }, // Satış fiyatı (Makinedeki satış fiyatı)
    timestamp: { type: Date, default: Date.now }, // Satış zamanı
});

module.exports = mongoose.model('SalesLog', salesLogSchema);
