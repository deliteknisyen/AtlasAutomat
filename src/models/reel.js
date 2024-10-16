const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true, unique: true },
    machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    productCount: { type: Number, required: true, default: 156 },
    compartments: { type: [Boolean], default: Array(156).fill(true) }, // Varsayılan 156 bölme dolu
    isActive: { type: Boolean, required: true, default: true },
    reorderLevel: { type: Number, default: 10 }, // Kritik stok seviyesi uyarısı
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Ürün referansı
    createdAt: { type: Date, default: Date.now },
});


// Makara oluşturulurken compartments dizisini doldur
reelSchema.pre('save', function (next) {
    if (this.isNew) {
        this.compartments = Array(this.productCount).fill(true); // Başlangıçta tüm bölmeler dolu
    }
    next();
});

module.exports = mongoose.model('Reel', reelSchema);
