// Klasör: src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');  // path modülü eklendi

// Route dosyaları
const reelRoutes = require('./routes/reelRoutes');
const machineRoutes = require('./routes/machineRoutes');
const productRoutes = require('./routes/productRoutes');
const personelRoutes = require('./routes/personelRoutes');
const companyRoutes = require('./routes/companyRoutes');
const deliveryLogRoutes = require('./routes/deliveryLogRoutes');
const salesLogRoutes = require('./routes/salesLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// MQTT Handler'lar
const mqttHandler = require('./mqttHandler'); // MQTT işlemleri başlatılıyor

// Express uygulaması oluşturma
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger ayarları
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Atlas Otomat Yönetimi',
            version: '1.0.0',
            description: 'Atlas Otomat Sistemi API Dökümantasyonu',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
    },
    apis: [path.join(__dirname, 'routes/*.js')], // Route dosyaları için dökümantasyon
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/firma_yonetimi')
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Route'lar
app.use('/api/machines', machineRoutes);
app.use('/api/products', productRoutes);
app.use('/api/personels', personelRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/deliveryLogs', deliveryLogRoutes);
app.use('/api/salesLogs', salesLogRoutes);
app.use('/api/notifications', notificationRoutes);

// MQTT Handler başlatma
mqttHandler.start();

// Hata yönetimi middleware
app.use((err, req, res, next) => {
    console.error('Global hata:', err);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

// Sunucu başlatma
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

module.exports = app;
