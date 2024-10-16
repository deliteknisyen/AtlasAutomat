// Klasör: src/routes
// Dosya: masterPersonnelRoutes.js

const express = require('express');
const router = express.Router();
const MasterPersonnel = require('../models/masterPersonnel');
const MasterCompany = require('../models/masterCompany');

// Personel ekleme
router.post('/', async (req, res) => {
    const { name, email, phone, role, masterCompanyId } = req.body;

    if (!name || !email || !phone || !masterCompanyId) {
        return res.status(400).json({ message: 'Tüm alanlar gerekli.' });
    }

    try {
        const masterCompany = await MasterCompany.findById(masterCompanyId);
        if (!masterCompany) {
            return res.status(404).json({ message: 'Firma bulunamadı.' });
        }

        const newPersonnel = new MasterPersonnel({ name, email, phone, role, masterCompany: masterCompanyId });
        const savedPersonnel = await newPersonnel.save();

        // Firma ile personeli ilişkilendiriyoruz
        masterCompany.personnel.push(savedPersonnel._id);
        await masterCompany.save();

        res.status(201).json(savedPersonnel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Personel bilgilerini getirme
router.get('/:id', async (req, res) => {
    try {
        const personnel = await MasterPersonnel.findById(req.params.id).populate('masterCompany');
        if (!personnel) {
            return res.status(404).json({ message: 'Personel bulunamadı.' });
        }
        res.json(personnel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Personel bilgilerini güncelleme
router.patch('/:id', async (req, res) => {
    const { name, email, phone, role } = req.body;

    try {
        const personnel = await MasterPersonnel.findById(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personel bulunamadı.' });
        }

        if (name) personnel.name = name;
        if (email) personnel.email = email;
        if (phone) personnel.phone = phone;
        if (role) personnel.role = role;

        const updatedPersonnel = await personnel.save();
        res.json(updatedPersonnel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Personel silme
router.delete('/:id', async (req, res) => {
    try {
        const personnel = await MasterPersonnel.findById(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personel bulunamadı.' });
        }
        await personnel.remove();
        res.json({ message: 'Personel başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
