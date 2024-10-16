const express = require('express');
const router = express.Router();
const DeliveryLog = require('../models/deliveryLog');

// Teslimat loglarını listele
router.get('/', async (req, res) => {
    try {
        const logs = await DeliveryLog.find().populate('reelId');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Belirli bir teslimat logunu getir
router.get('/:id', async (req, res) => {
    try {
        const log = await DeliveryLog.findById(req.params.id).populate('reelId');
        if (!log) {
            return res.status(404).json({ message: 'Log bulunamadı' });
        }
        res.json(log);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni bir teslimat logu ekle
router.post('/', async (req, res) => {
    const { reelId, compartmentNumber, cardId, timestamp } = req.body;

    const log = new DeliveryLog({
        reelId,
        compartmentNumber,
        cardId,
        timestamp
    });

    try {
        const newLog = await log.save();
        res.status(201).json(newLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Belirli bir teslimat logunu sil
router.delete('/:id', async (req, res) => {
    try {
        const log = await DeliveryLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log bulunamadı' });
        }
        await log.remove();
        res.json({ message: 'Log başarıyla silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryLog:
 *       type: object
 *       required:
 *         - reelId
 *         - compartmentNumber
 *         - cardId
 *         - timestamp
 *       properties:
 *         id:
 *           type: string
 *           description: Teslimat logunun otomatik oluşturulan ID'si
 *         reelId:
 *           type: string
 *           description: Teslimat yapılan makaranın ID'si
 *         compartmentNumber:
 *           type: integer
 *           description: Teslimat yapılan bölmenin numarası
 *         cardId:
 *           type: string
 *           description: Ürünü alan kartın ID'si (RFID)
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Ürün teslimatının zamanı
 *       example:
 *         id: 60c72b2f5f1b2c001c8e4b3b
 *         reelId: 60c72b2f5f1b2c001c8e4b3b
 *         compartmentNumber: 2
 *         cardId: "123456789"
 *         timestamp: "2024-10-14T19:16:44.162Z"
 */

/**
 * @swagger
 * tags:
 *   name: DeliveryLogs
 *   description: Ürün teslimat logları yönetimi
 */

/**
 * @swagger
 * /api/deliveryLogs:
 *   get:
 *     summary: Tüm teslimat loglarını listeler
 *     tags: [DeliveryLogs]
 *     responses:
 *       200:
 *         description: Teslimat loglarının listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeliveryLog'
 */

/**
 * @swagger
 * /api/deliveryLogs/{id}:
 *   get:
 *     summary: Belirli bir teslimat logunu getirir
 *     tags: [DeliveryLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Teslimat logunun ID'si
 *     responses:
 *       200:
 *         description: Teslimat logu detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryLog'
 *       404:
 *         description: Log bulunamadı
 */

/**
 * @swagger
 * /api/deliveryLogs:
 *   post:
 *     summary: Yeni bir teslimat logu ekler
 *     tags: [DeliveryLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryLog'
 *     responses:
 *       201:
 *         description: Yeni teslimat logu oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryLog'
 *       400:
 *         description: Geçersiz girdi
 */

/**
 * @swagger
 * /api/deliveryLogs/{id}:
 *   delete:
 *     summary: Belirli bir teslimat logunu siler
 *     tags: [DeliveryLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Teslimat logunun ID'si
 *     responses:
 *       200:
 *         description: Log başarıyla silindi
 *       404:
 *         description: Log bulunamadı
 */
