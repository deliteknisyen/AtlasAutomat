// Klasör: src/routes
// Dosya: reelRoutes.js

const express = require('express');
const router = express.Router();
const Reel = require('../models/reel');
const Machine = require('../models/machines');
const Product = require('../models/product');

// Yeni makara ekleme
router.post('/', async (req, res) => {
    const { serialNumber, machineId, productCount, product } = req.body;

    // Alanların varlık kontrolü
    if (!serialNumber || !machineId || productCount == null || !product) {
        return res.status(400).json({ message: "Eksik bilgiler var. Seri numarası, ürün sayısı ve ürün ID'si gerekli." });
    }

    try {
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).json({ message: 'Makine bulunamadı. ID: ' + machineId });
        }

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({ message: 'Ürün bulunamadı. ID: ' + product });
        }

        const reel = new Reel({
            serialNumber,
            machineId,
            productCount,
            product,  // Ürünü ekliyoruz
        });

        const newReel = await reel.save();
        machine.reels.push(newReel._id); // Makineye makarayı ekliyoruz
        await machine.save(); // Makineyi kaydediyoruz

        res.status(201).json(newReel);
    } catch (err) {
        res.status(500).json({ message: 'Makara kaydedilemedi: ' + err.message });
    }
});

// Belirli bir makaranın bilgilerini getirme
router.get('/:id', async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id).populate('machineId product');
        if (!reel) {
            return res.status(404).json({ message: 'Makara bulunamadı' });
        }
        res.json(reel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Makara ürün sayısını güncelleme (teslimat sonrası azaltma)
router.patch('/:id/deliver', async (req, res) => {
    try {
        const updatedReel = await Reel.findOneAndUpdate(
            { _id: req.params.id, productCount: { $gt: 0 } },
            { $inc: { productCount: -1 } },
            { new: true }
        );

        if (!updatedReel) {
            return res.status(400).json({ message: 'Makara boş, ürün kalmadı' });
        }
        res.json({ message: 'Bir ürün teslim edildi', remaining: updatedReel.productCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Yeni makara takma (mevcut makarayı devre dışı bırakma ve yeni makara ekleme)
router.post('/:machineId/new-reel', async (req, res) => {
    const { serialNumber, productCount, product } = req.body;
    const machineId = req.params.machineId;

    // Alan kontrolleri
    if (!serialNumber || productCount == null || !product) {
        return res.status(400).json({ message: "Eksik bilgiler var. Seri numarası, ürün sayısı ve ürün ID'si gerekli." });
    }

    try {
        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).json({ message: 'Makine bulunamadı. ID: ' + machineId });
        }

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({ message: 'Ürün bulunamadı. ID: ' + product });
        }

        // Mevcut aktif makarayı devre dışı bırakma
        await Reel.updateMany(
            { machineId, isActive: true },
            { isActive: false }
        );

        // Yeni makara ekleme
        const newReel = new Reel({
            serialNumber,
            machineId,
            productCount,
            product,  // Ürünü ekliyoruz
        });

        await newReel.save();
        machine.reels.push(newReel._id);
        await machine.save();

        res.status(201).json(newReel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Reel:
 *       type: object
 *       required:
 *         - serialNumber
 *         - machineId
 *         - productCount
 *         - product
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik olarak oluşturulan makara ID'si
 *         serialNumber:
 *           type: string
 *           description: Makaranın seri numarası
 *         machineId:
 *           type: string
 *           description: Makara ile ilişkilendirilmiş makine ID'si
 *         productCount:
 *           type: integer
 *           description: Makaranın içerdiği ürün sayısı
 *         product:
 *           type: string
 *           description: Makara ile ilişkilendirilmiş ürün ID'si
 *         isActive:
 *           type: boolean
 *           description: Makaranın aktif olup olmadığı
 *       example:
 *         id: 60c72b2f5f1b2c001c8e4b3b
 *         serialNumber: REEL123456
 *         machineId: 60c72b2f5f1b2c001c8e4b3a
 *         productCount: 10
 *         product: 670cdb6312f975838f039040
 *         isActive: true
 */

/**
 * @swagger
 * tags:
 *   name: Reels
 *   description: Makara yönetimi API'leri
 */

/**
 * @swagger
 * /api/reels:
 *   post:
 *     summary: Yeni makara ekler
 *     tags: [Reels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reel'
 *     responses:
 *       201:
 *         description: Yeni makara oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 *       400:
 *         description: Geçersiz girdi
 */

/**
 * @swagger
 * /api/reels/{id}:
 *   get:
 *     summary: Belirli bir makaranın bilgilerini getirir
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Makara ID'si
 *     responses:
 *       200:
 *         description: Belirli bir makara
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Makara bulunamadı
 */

/**
 * @swagger
 * /api/reels/{id}/deliver:
 *   patch:
 *     summary: Bir ürünü teslim eder ve ürün sayısını günceller
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Makara ID'si
 *     responses:
 *       200:
 *         description: Bir ürün teslim edildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bir ürün teslim edildi
 *                 remaining:
 *                   type: integer
 *                   description: Kalan ürün sayısı
 *       400:
 *         description: Makara boş veya geçersiz işlem
 *       404:
 *         description: Makara bulunamadı
 */

/**
 * @swagger
 * /api/reels/{machineId}/new-reel:
 *   post:
 *     summary: Yeni bir makara takar ve mevcut aktif makarayı devre dışı bırakır
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: machineId
 *         schema:
 *           type: string
 *         required: true
 *         description: Makinenin ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reel'
 *     responses:
 *       201:
 *         description: Yeni makara başarıyla eklendi ve aktif oldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 *       400:
 *         description: Geçersiz girdi
 *       404:
 *         description: Makine bulunamadı
 */
