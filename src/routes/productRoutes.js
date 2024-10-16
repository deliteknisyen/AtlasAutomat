// Klasör: src/routes
// Dosya: productRoutes.js

const express = require('express');
const router = express.Router();
const Product = require('../models/product');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - productName
 *         - productCode
 *         - stockQuantity
 *         - category
 *         - purchasePrice
 *         - salePrice
 *       properties:
 *         id:
 *           type: string
 *           description: Otomatik olarak oluşturulan ürün ID'si
 *         productName:
 *           type: string
 *           description: Ürün adı
 *         productCode:
 *           type: string
 *           description: Benzersiz ürün kodu
 *         stockQuantity:
 *           type: number
 *           description: Stok miktarı
 *         category:
 *           type: string
 *           description: Ürün kategorisi
 *         purchasePrice:
 *           type: number
 *           description: Ürünün alış fiyatı
 *         salePrice:
 *           type: number
 *           description: Ürünün satış fiyatı
 *         lastSaleDate:
 *           type: string
 *           format: date
 *           description: Son satış tarihi
 *         lastPurchaseDate:
 *           type: string
 *           format: date
 *           description: Son alış tarihi
 *         lastPurchaseMachine:
 *           type: string
 *           description: Son alım yapan makinenin seri numarası
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Ürün yönetimi için API'
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri listeler
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Tüm ürünlerin listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

// Tüm ürünleri listele (Pagination eklenmiş)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const products = await Product.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.countDocuments();
        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Belirli bir ürünü getirir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ürün ID'si
 *     responses:
 *       200:
 *         description: Belirli bir ürün
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Ürün bulunamadı
 */

// Belirli bir ürünü getirme
router.get('/:id', getProduct, (req, res) => {
    res.json(res.product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni ürün ekler
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Yeni ürün oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Geçersiz girdi
 */

// Yeni ürün ekleme
router.post('/', async (req, res) => {
    const product = new Product({
        productName: req.body.productName,
        productCode: req.body.productCode,
        stockQuantity: req.body.stockQuantity,
        category: req.body.category,
        purchasePrice: req.body.purchasePrice,
        salePrice: req.body.salePrice,
        lastSaleDate: req.body.lastSaleDate,
        lastPurchaseDate: req.body.lastPurchaseDate,
        lastPurchaseMachine: req.body.lastPurchaseMachine
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Belirli bir ürünü günceller
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ürün ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Güncellenmiş ürün bilgisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Geçersiz girdi
 *       404:
 *         description: Ürün bulunamadı
 */

// Belirli bir ürünü güncelleme
router.patch('/:id', getProduct, async (req, res) => {
    const updates = Object.keys(req.body);
    updates.forEach(update => {
        res.product[update] = req.body[update];
    });

    try {
        const updatedProduct = await res.product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Belirli bir ürünü siler
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ürün ID'si
 *     responses:
 *       200:
 *         description: Ürün silindi
 *       404:
 *         description: Ürün bulunamadı
 */

// Belirli bir ürünü silme
router.delete('/:id', getProduct, async (req, res) => {
    try {
        await res.product.remove();
        res.json({ message: 'Ürün silindi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware: ID'ye göre ürünü bulma
async function getProduct(req, res, next) {
    let product;
    try {
        product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.product = product;
    next();
}

module.exports = router;
