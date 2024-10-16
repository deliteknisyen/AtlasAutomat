// Klasör: src
// Dosya: app.js

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const reelRoutes = require('./routes/reelRoutes');
const companyRoutes = require('./routes/companyRoutes');
const machineRoutes = require('./routes/machineRoutes');
const productRoutes = require('./routes/productRoutes');
const personelRoutes = require('./routes/personelRoutes')
const deliveryLogRoutes = require('./routes/deliveryLogRoutes');
const salesLogRoutes = require('./routes/salesLogRoutes'); // salesLog rotalarını ekliyoruz





const cors = require('cors');
require('dotenv').config(); // .env dosyasından değişkenleri okur

// Express uygulaması oluşturma
const app = express();

// CORS ayarları
const corsOptions = {
    origin: '*', // Tüm domainlerden gelen isteklere izin verir
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // İzin verilen HTTP metotları
    allowedHeaders: ['Content-Type', 'Authorization'], // İzin verilen başlıklar
    optionsSuccessStatus: 204 // CORS ön istekleri için başarılı durumu belirtiyor
};

// CORS middleware'i ekleme
app.use(cors(corsOptions));

// JSON iletileri işlemek için middleware
app.use(express.json());

// Loglama fonksiyonu
function logMessage(message) {
    const logFilePath = path.join(__dirname, 'logs', 'mqtt_logs.txt');
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    console.log(message);
}

// Swagger security ayarlarını kaldır
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Atlas Otomat Management',
            version: '1.0.0',
            description: 'Atlas Otomat Yönetimi Dökümantasyonu',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server'
            }
        ],
        components: {
            securitySchemes: {}
        },
        security: []
    },
    apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// MongoDB veritabanı bağlantısı
async function connectToDatabase() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/firma_yonetimi'; // Basit URI kullanımı

    try {
        await mongoose.connect(MONGO_URI);
        logMessage('MongoDB bağlantısı başarılı');
    } catch (error) {
        logMessage('MongoDB bağlantısı başarısız: ' + error.message);
    }
}

connectToDatabase();

// MQTT Handler'ı dahil etme (app.use() kullanmanıza gerek yok)
require('./routes/mqttHandler');



// Routes kullanımı
app.use('/api/machines', machineRoutes);
app.use('/api/products', productRoutes);
app.use('/api/personels', personelRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/deliveryLogs', deliveryLogRoutes);
app.use('/api/salesLogs', salesLogRoutes); // salesLogRoutes'u kullan



// Global hata yönetimi middleware
app.use((err, req, res, next) => {
    console.error('Global hata:', {
        message: err.message,
        stack: err.stack,
        reqBody: req.body,
        reqHeaders: req.headers,
    });
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

// Sunucuyu başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logMessage(`Sunucu ${PORT} portunda çalışıyor`);
});
