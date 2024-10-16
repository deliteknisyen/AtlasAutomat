// Klasör: src/routes
// Dosya: notificationRoutes.js

const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Bildirim oluşturma
router.post('/', async (req, res) => {
    const { type, message, machineId, reelId, recipient } = req.body;

    if (!type || !message || !recipient) {
        return res.status(400).json({ message: 'Eksik bilgiler var. Bildirim türü, mesaj ve alıcı gerekli.' });
    }

    try {
        const newNotification = new Notification({ type, message, machineId, reelId, recipient });
        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Bildirimleri listeleme (belirli bir personele göre)
router.get('/personnel/:personnelId', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.personnelId });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Bildirim okundu olarak işaretleme
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Bildirim bulunamadı' });
        }

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
