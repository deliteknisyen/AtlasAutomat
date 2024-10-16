// Klasör: src/routes
// Dosya: companyRoutes.js

const express = require('express');
const router = express.Router();
const Company = require('../models/company');

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - companyName
 *         - VKN
 *         - address
 *         - city
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik oluşturulan şirket ID'si
 *         companyName:
 *           type: string
 *           description: Şirketin adı
 *         VKN:
 *           type: string
 *           description: Vergi Kimlik Numarası
 *         address:
 *           type: string
 *           description: Şirketin adresi
 *         city:
 *           type: string
 *           description: Şirketin bulunduğu şehir
 *         district:
 *           type: string
 *           description: Şirketin bulunduğu ilçe
 *         phone:
 *           type: string
 *           description: Şirketin telefon numarası
 *         email:
 *           type: string
 *           description: Şirketin e-posta adresi
 *         website:
 *           type: string
 *           description: Şirketin web sitesi
 *         establishedDate:
 *           type: string
 *           format: date
 *           description: Şirketin kuruluş tarihi
 *         personel:
 *           type: array
 *           items:
 *             type: string
 *           description: Şirkete bağlı personel ID'leri
 *         status:
 *           type: string
 *           description: Şirketin durumu (active/inactive)
 *       example:
 *         id: 60c72b2f5f1b2c001c8e4b3b
 *         companyName: Atlas Otomat
 *         VKN: 1234567890
 *         address: Yıldız Cad. No:10
 *         city: İstanbul
 *         district: Beşiktaş
 *         phone: +90 212 123 45 67
 *         email: info@atlasotomat.com
 *         website: https://www.atlasotomat.com
 *         establishedDate: 2020-01-01
 *         personel: []
 *         status: active
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Tüm şirketleri listeler
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Tüm şirketlerin listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 */

// Tüm şirketleri listele
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find();
        res.json(companies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Belirli bir şirketi getirir
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Şirket ID'si
 *     responses:
 *       200:
 *         description: Belirli bir şirket
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Şirket bulunamadı
 */

// Belirli bir şirketi getirme
router.get('/:id', getCompany, (req, res) => {
    res.json(res.company);
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Yeni şirket ekler
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       201:
 *         description: Yeni şirket oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Geçersiz girdi
 */

// Yeni şirket ekleme
router.post('/', async (req, res) => {
    const company = new Company({
        companyName: req.body.companyName,
        VKN: req.body.VKN,
        address: req.body.address,
        city: req.body.city,
        district: req.body.district,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        establishedDate: req.body.establishedDate,
        personel: req.body.personel,
        status: req.body.status
    });
    try {
        const newCompany = await company.save();
        res.status(201).json(newCompany);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   patch:
 *     summary: Belirli bir şirketi günceller
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Şirket ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Güncellenmiş şirket bilgisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Geçersiz girdi
 *       404:
 *         description: Şirket bulunamadı
 */

// Belirli bir şirketi güncelleme
router.patch('/:id', getCompany, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        'companyName', 'VKN', 'address', 'city', 'district',
        'phone', 'email', 'website', 'establishedDate', 'personel', 'status'
    ];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Geçersiz güncelleme alanları' });
    }

    try {
        updates.forEach((update) => {
            res.company[update] = req.body[update];
        });
        const updatedCompany = await res.company.save();
        res.json(updatedCompany);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Belirli bir şirketi siler
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Şirket ID'si
 *     responses:
 *       200:
 *         description: Şirket silindi
 *       404:
 *         description: Şirket bulunamadı
 */

// Belirli bir şirketi silme
router.delete('/:id', getCompany, async (req, res) => {
    try {
        await res.company.remove();
        res.json({ message: 'Şirket silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware: ID'ye göre şirketi bulma
async function getCompany(req, res, next) {
    let company;
    try {
        company = await Company.findById(req.params.id);
        if (company == null) {
            return res.status(404).json({ message: 'Şirket bulunamadı' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.company = company;
    next();
}

module.exports = router;
