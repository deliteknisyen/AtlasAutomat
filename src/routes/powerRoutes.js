// Klasör: src/routes
// Dosya: powerRoutes.js

const express = require('express');
const router = express.Router();
const PowerConsumption = require('../models/powerConsumption');

// Elektrik tüketimi verilerini getirme
router.get('/power/:serialNumber', async (req, res) => {
    const { serialNumber } = req.params;

    try {
        const data = await PowerConsumption.find({ serialNumber }).sort({ timestamp: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Veri alınırken hata oluştu', error });
    }
});

module.exports = router;
