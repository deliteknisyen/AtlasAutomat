// Klasör: src/routes
// Dosya: masterCompanyRoutes.js

const express = require('express');
const router = express.Router();
const MasterCompany = require('../models/masterCompany');

/**
 * @swagger
 * tags:
 *   name: MasterCompany
 *   description: Firma yönetimi işlemleri
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Tüm firmaları getir
 *     tags: [MasterCompany]
 *     responses:
 *       200:
 *         description: Tüm firmalar başarıyla listelendi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MasterCompany'
 */
router.get('/', async (req, res) => {
    try {
        const companies = await MasterCompany.find().populate('personnel');
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: ID ile firma getir
 *     tags: [MasterCompany]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Firmanın ID'si
 *     responses:
 *       200:
 *         description: Firma başarıyla bulundu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterCompany'
 *       404:
 *         description: Firma bulunamadı
 */
router.get('/:id', async (req, res) => {
    try {
        const company = await MasterCompany.findById(req.params.id).populate('personnel');
        if (!company) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Yeni firma ekle
 *     tags: [MasterCompany]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MasterCompany'
 *     responses:
 *       201:
 *         description: Yeni firma başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterCompany'
 *       400:
 *         description: Geçersiz veri
 */
router.post('/', async (req, res) => {
    const company = new MasterCompany({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        personnel: req.body.personnel
    });

    try {
        const newCompany = await company.save();
        res.status(201).json(newCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: ID ile firma güncelle
 *     tags: [MasterCompany]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Güncellenecek firmanın ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MasterCompany'
 *     responses:
 *       200:
 *         description: Firma başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterCompany'
 *       404:
 *         description: Firma bulunamadı
 *       400:
 *         description: Geçersiz veri
 */
router.put('/:id', async (req, res) => {
    try {
        const company = await MasterCompany.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }

        company.name = req.body.name || company.name;
        company.email = req.body.email || company.email;
        company.phone = req.body.phone || company.phone;
        company.address = req.body.address || company.address;
        company.personnel = req.body.personnel || company.personnel;

        const updatedCompany = await company.save();
        res.json(updatedCompany);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: ID ile firma sil
 *     tags: [MasterCompany]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Silinecek firmanın ID'si
 *     responses:
 *       200:
 *         description: Firma başarıyla silindi
 *       404:
 *         description: Firma bulunamadı
 */
router.delete('/:id', async (req, res) => {
    try {
        const company = await MasterCompany.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Firma bulunamadı' });
        }
        await company.remove();
        res.json({ message: 'Firma silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

