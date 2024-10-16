// Klasör: src/routes
// Dosya: salesLogRoutes.js

const express = require('express');
const router = express.Router();
const SalesLog = require('../models/salesLog');

// Satış loglarını listele
router.get('/', async (req, res) => {
    try {
        const logs = await SalesLog.find().populate('reelId productId');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Belirli bir satış logunu getir
router.get('/:id', async (req, res) => {
    try {
        const log = await SalesLog.findById(req.params.id).populate('reelId productId');
        if (!log) {
            return res.status(404).json({ message: 'Log bulunamadı' });
        }
        res.json(log);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni bir satış logu ekle
router.post('/', async (req, res) => {
    const { reelId, productId, compartmentNumber, cardId, salePrice } = req.body;

    const log = new SalesLog({
        reelId,
        productId,
        compartmentNumber,
        cardId,
        salePrice,
    });

    try {
        const newLog = await log.save();
        res.status(201).json(newLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Belirli bir satış logunu sil
router.delete('/:id', async (req, res) => {
    try {
        const log = await SalesLog.findById(req.params.id);
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
 *     SalesLog:
 *       type: object
 *       required:
 *         - reelId
 *         - productId
 *         - compartmentNumber
 *         - cardId
 *         - salePrice
 *       properties:
 *         id:
 *           type: string
 *           description: Satış logunun otomatik oluşturulan ID'si
 *         reelId:
 *           type: string
 *           description: Satışın yapıldığı makaranın ID'si
 *         productId:
 *           type: string
 *           description: Satılan ürünün ID'si
 *         compartmentNumber:
 *           type: integer
 *           description: Teslim edilen compartment numarası
 *         cardId:
 *           type: string
 *           description: Ürünü alan kartın ID'si (RFID)
 *         salePrice:
 *           type: number
 *           description: Ürünün satış fiyatı
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Satışın yapıldığı zaman
 *       example:
 *         id: 60c72b2f5f1b2c001c8e4b3b
 *         reelId: 60c72b2f5f1b2c001c8e4b3b
 *         productId: 670cdb6312f975838f039040
 *         compartmentNumber: 5
 *         cardId: "1:d9:e5:2e"
 *         salePrice: 35
 *         timestamp: "2024-10-15T00:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: SalesLogs
 *   description: Ürün satış logları yönetimi
 */

/**
 * @swagger
 * /api/salesLogs:
 *   get:
 *     summary: Tüm satış loglarını listeler
 *     tags: [SalesLogs]
 *     responses:
 *       200:
 *         description: Satış loglarının listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SalesLog'
 */

/**
 * @swagger
 * /api/salesLogs/{id}:
 *   get:
 *     summary: Belirli bir satış logunu getirir
 *     tags: [SalesLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Satış logunun ID'si
 *     responses:
 *       200:
 *         description: Satış logu detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesLog'
 *       404:
 *         description: Log bulunamadı
 */

/**
 * @swagger
 * /api/salesLogs:
 *   post:
 *     summary: Yeni bir satış logu ekler
 *     tags: [SalesLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalesLog'
 *     responses:
 *       201:
 *         description: Yeni satış logu oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesLog'
 *       400:
 *         description: Geçersiz girdi
 */

/**
 * @swagger
 * /api/salesLogs/{id}:
 *   delete:
 *     summary: Belirli bir satış logunu siler
 *     tags: [SalesLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Satış logunun ID'si
 *     responses:
 *       200:
 *         description: Log başarıyla silindi
 *       404:
 *         description: Log bulunamadı
 */
