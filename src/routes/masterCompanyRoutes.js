// Klasör: src/routes
// Dosya: masterCompanyRoutes.js

const express = require('express');
const router = express.Router();
const MasterCompany = require('../models/masterCompany');

// Firma ekleme
router.post('/', async (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
        return res.status(400).json({ message: 'Tüm alanlar gerekli.' });
    }

    try {
        const newMasterCompany = new MasterCompany({ name, email, phone, address });
        const savedMasterCompany = await newMasterCompany.save();
        res.status(201).json(savedMasterCompany);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Firma bilgilerini getirme
router.get('/:id', async (req, res) => {
    try {
        const masterCompany = await MasterCompany.findById(req.params.id).populate('personnel');
        if (!masterCompany) {
            return res.status(404).json({ message: 'Firma bulunamadı.' });
        }
        res.json(masterCompany);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Firma bilgilerini güncelleme
router.patch('/:id', async (req, res) => {
    const { name, email, phone, address } = req.body;

    try {
        const masterCompany = await MasterCompany.findById(req.params.id);
        if (!masterCompany) {
            return res.status(404).json({ message: 'Firma bulunamadı.' });
        }

        if (name) masterCompany.name = name;
        if (email) masterCompany.email = email;
        if (phone) masterCompany.phone = phone;
        if (address) masterCompany.address = address;

        const updatedMasterCompany = await masterCompany.save();
        res.json(updatedMasterCompany);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Firma silme
router.delete('/:id', async (req, res) => {
    try {
        const masterCompany = await MasterCompany.findById(req.params.id);
        if (!masterCompany) {
            return res.status(404).json({ message: 'Firma bulunamadı.' });
        }
        await masterCompany.remove();
        res.json({ message: 'Firma başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
