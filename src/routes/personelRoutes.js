// Klasör: src/routes
// Dosya: personelRoutes.js

const express = require('express');
const router = express.Router();
const Personel = require('../models/personel');

/**
 * @swagger
 * components:
 *   schemas:
 *     Personel:
 *       type: object
 *       required:
 *         - TCKN
 *         - kartID
 *         - ad
 *         - soyad
 *         - urunAlmaHakki
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik olarak oluşturulan personel ID'si
 *         TCKN:
 *           type: string
 *           description: Personelin T.C. kimlik numarası
 *         kartID:
 *           type: string
 *           description: Personelin kart ID'si
 *         ad:
 *           type: string
 *           description: Personelin adı
 *         soyad:
 *           type: string
 *           description: Personelin soyadı
 *         telefon:
 *           type: string
 *           description: Personelin telefon numarası
 *         eposta:
 *           type: string
 *           description: Personelin e-posta adresi
 *         dogumTarihi:
 *           type: string
 *           format: date
 *           description: Personelin doğum tarihi
 *         cinsiyet:
 *           type: string
 *           description: Personelin cinsiyeti
 *         adres:
 *           type: string
 *           description: Personelin adresi
 *         il:
 *           type: string
 *           description: Personelin ili
 *         ilce:
 *           type: string
 *           description: Personelin ilçesi
 *         semt:
 *           type: string
 *           description: Personelin semti
 *         urunAlmaHakki:
 *           type: boolean
 *           description: Personelin ürün alma hakkı olup olmadığı
 *       example:
 *         TCKN: "12345678901"
 *         kartID: "1a2b3c4d5e"
 *         ad: "Murat"
 *         soyad: "Dalgıç"
 *         telefon: "05551234567"
 *         eposta: "murat@example.com"
 *         dogumTarihi: "1990-01-01"
 *         cinsiyet: "Erkek"
 *         adres: "İstanbul, Kadıköy"
 *         il: "İstanbul"
 *         ilce: "Kadıköy"
 *         semt: "Moda"
 *         urunAlmaHakki: true
 */

/**
 * @swagger
 * tags:
 *   name: Personel
 *   description: Personel yönetimi
 */

/**
 * @swagger
 * /api/personel:
 *   get:
 *     summary: Tüm personelleri listeler
 *     tags: [Personel]
 *     responses:
 *       200:
 *         description: Tüm personellerin listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personel'
 */

// Tüm personelleri listele (Pagination ile)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const personeller = await Personel.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const totalPersoneller = await Personel.countDocuments();
        res.json({
            personeller,
            totalPages: Math.ceil(totalPersoneller / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/personel/{id}:
 *   get:
 *     summary: Belirli bir personeli getirir
 *     tags: [Personel]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Personel ID'si
 *     responses:
 *       200:
 *         description: Belirli bir personel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personel'
 *       404:
 *         description: Personel bulunamadı
 */

// Belirli bir personeli getirme
router.get('/:id', getPersonel, (req, res) => {
    res.json(res.personel);
});

/**
 * @swagger
 * /api/personel:
 *   post:
 *     summary: Yeni personel ekler
 *     tags: [Personel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Personel'
 *     responses:
 *       201:
 *         description: Yeni personel oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personel'
 *       400:
 *         description: Geçersiz girdi
 */

// Yeni personel ekleme
router.post('/', async (req, res) => {
    const personel = new Personel(req.body);
    try {
        const yeniPersonel = await personel.save();
        res.status(201).json(yeniPersonel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/personel/{id}:
 *   patch:
 *     summary: Belirli bir personeli günceller
 *     tags: [Personel]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Personel ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Personel'
 *     responses:
 *       200:
 *         description: Güncellenmiş personel bilgisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personel'
 *       400:
 *         description: Geçersiz girdi
 *       404:
 *         description: Personel bulunamadı
 */

// Belirli bir personeli güncelleme
router.patch('/:id', getPersonel, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['TCKN', 'kartID', 'ad', 'soyad', 'telefon', 'eposta', 'dogumTarihi', 'cinsiyet', 'adres', 'il', 'ilce', 'semt', 'urunAlmaHakki'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Geçersiz güncelleme alanları' });
    }

    try {
        updates.forEach(update => res.personel[update] = req.body[update]);
        const guncellenmisPersonel = await res.personel.save();
        res.json(guncellenmisPersonel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/personel/{id}:
 *   delete:
 *     summary: Belirli bir personeli siler
 *     tags: [Personel]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Personel ID'si
 *     responses:
 *       200:
 *         description: Personel silindi
 *       404:
 *         description: Personel bulunamadı
 */

// Belirli bir personeli silme
router.delete('/:id', getPersonel, async (req, res) => {
    try {
        await res.personel.remove();
        res.json({ message: 'Personel silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware: ID'ye göre personeli bulma
async function getPersonel(req, res, next) {
    let personel;
    try {
        personel = await Personel.findById(req.params.id);
        if (!personel) {
            return res.status(404).json({ message: 'Personel bulunamadı' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.personel = personel;
    next();
}

module.exports = router;
