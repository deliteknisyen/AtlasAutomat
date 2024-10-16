// Klasör: src/models
// Dosya: product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['İş Eldiveni', 'İş Güvenliği Gözlüğü', 'Baret', 'Koruyucu Maske', 'Güvenlik Ayakkabısı']
    },
    purchasePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    lastSaleDate: { type: Date },
    lastPurchaseDate: { type: Date },
    lastPurchaseMachine: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
