// Klasör: src/routes
// Dosya: machineRoutes.js

const express = require('express');
const router = express.Router();
const Machine = require('../models/machines');

// Tüm makineleri listele
router.get('/', async (req, res) => {
    try {
        const machines = await Machine.find();
        res.json(machines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Belirli bir makineyi getirme
router.get('/:id', getMachine, (req, res) => {
    res.json(res.machine);
});

// Yeni makine ekleme
router.post('/', async (req, res) => {
    const machine = new Machine({
        serialNumber: req.body.serialNumber,
        model: req.body.model,
        isActive: req.body.isActive,
        status: req.body.status
    });
    try {
        const newMachine = await machine.save();
        res.status(201).json(newMachine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Belirli bir makineyi güncelleme
router.patch('/:id', getMachine, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['serialNumber', 'model', 'isActive', 'status'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Geçersiz güncelleme alanları' });
    }

    try {
        updates.forEach((update) => (res.machine[update] = req.body[update]));
        const updatedMachine = await res.machine.save();
        res.json(updatedMachine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Belirli bir makineyi silme
router.delete('/:id', getMachine, async (req, res) => {
    try {
        await res.machine.remove();
        res.json({ message: 'Makine silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware: ID'ye göre makineyi bulma
async function getMachine(req, res, next) {
    let machine;
    try {
        machine = await Machine.findById(req.params.id);
        if (machine == null) {
            return res.status(404).json({ message: 'Makine bulunamadı' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.machine = machine;
    next();
}

// Yeni endpoint: Ürün teslimi (step motor kontrolü)
router.post('/:id/deliver', async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) {
            return res.status(404).json({ message: 'Makine bulunamadı' });
        }

        // Burada ESP32'ye veya doğrudan step motor sürücüsüne komut gönderilebilir.
        console.log(`Makine (${req.params.id}) için ürün teslimi başlatılıyor...`);

        // Ürün teslim işlemini gerçekleştir
        res.json({ message: 'Ürün teslim edildi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Machine:
 *       type: object
 *       required:
 *         - serialNumber
 *         - model
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik olarak oluşturulan makine ID'si
 *         serialNumber:
 *           type: string
 *           description: Makinenin seri numarası
 *         model:
 *           type: string
 *           description: Makine modeli
 *         isActive:
 *           type: boolean
 *           description: Makinenin aktif olup olmadığı
 *         status:
 *           type: string
 *           description: Makinenin durumu
 *       example:
 *         id: 60c72b2f5f1b2c001c8e4b3b
 *         serialNumber: SN123456
 *         model: Model X
 *         isActive: true
 *         status: online
 */

/**
 * @swagger
 * tags:
 *   name: Machines
 *   description: Makine yönetimi API'leri
 */

/**
 * @swagger
 * /api/machines:
 *   get:
 *     summary: Tüm makineleri listeler
 *     tags: [Machines]
 *     responses:
 *       200:
 *         description: Tüm makinelerin listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Machine'
 */

/**
 * @swagger
 * /api/machines/{id}:
 *   get:
 *     summary: Belirli bir makineyi getirir
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Makine ID'si
 *     responses:
 *       200:
 *         description: Belirli bir makine
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Machine'
 *       404:
 *         description: Makine bulunamadı
 */

/**
 * @swagger
 * /api/machines:
 *   post:
 *     summary: Yeni makine ekler
 *     tags: [Machines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Machine'
 *     responses:
 *       201:
 *         description: Yeni makine oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Machine'
 *       400:
 *         description: Geçersiz girdi
 */

/**
 * @swagger
 * /api/machines/{id}:
 *   patch:
 *     summary: Belirli bir makineyi günceller
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Makine ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Machine'
 *     responses:
 *       200:
 *         description: Güncellenmiş makine bilgisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Machine'
 *       400:
 *         description: Geçersiz girdi
 *       404:
 *         description: Makine bulunamadı
 */

/**
 * @swagger
 * /api/machines/{id}:
 *   delete:
 *     summary: Belirli bir makineyi siler
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Makine ID'si
 *     responses:
 *       200:
 *         description: Makine silindi
 *       404:
 *         description: Makine bulunamadı
 */

/**
 * @swagger
 * /api/machines/{id}/deliver:
 *   post:
 *     summary: Belirli bir makineden ürün teslimi yapar
 *     tags: [Machines]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Teslim edilecek makinenin ID'si
 *     responses:
 *       200:
 *         description: Ürün teslim edildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ürün teslim edildi
 *       404:
 *         description: Makine bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
