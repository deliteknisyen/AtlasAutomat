// Klasör: src/models
// Dosya: company.js

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true, unique: true },
    VKN: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    website: { type: String, required: false },
    establishedDate: { type: Date, required: false },
    personel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Personel' }],
    status: { type: String, required: true, enum: ['active', 'inactive'] },

});

module.exports = mongoose.model('Company', companySchema);