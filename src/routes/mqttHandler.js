// Klasör: src/mqttHandler.js

const mqtt = require('mqtt');
const handleCardCheck = require('./mqttHandlers/handleCard');
const handleRegister = require('./mqttHandlers/handleRegister');
const handleHeartbeat = require('./mqttHandlers/handleHeartbeat');
const handleProductDeliveryRequest = require('./mqttHandlers/productDeliveryHandler');
const { logMessage } = require('./utils/logger');

let client = null;  // Global MQTT client değişkeni

// MQTT Client'in tek sefer başlatılmasını sağla (Singleton Deseni)
function start() {
    if (!client) {
        logMessage('MQTT işlemleri başlatılıyor...');

        // MQTT Broker bağlantı ayarları
        const mqttOptions = {
            clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
            clean: true,
            reconnectPeriod: 1000,
        };

        // MQTT Broker bağlantısı
        client = mqtt.connect('mqtt://154.53.160.79', mqttOptions);

        // MQTT bağlantısı olduğunda log mesajı
        client.on('connect', () => {
            logMessage('MQTT Broker bağlantısı başarılı');
            client.subscribe([
                'machines/card',
                'machines/register',
                'machines/heartbeat',
                'machines/delivery/request',
            ], (err) => {
                if (err) {
                    logMessage('Abonelik hatası: ' + err.message, 'error');
                } else {
                    logMessage('Başarıyla abone olundu');
                }
            });
        });

        // MQTT mesajlarını işlemek için
        client.on('message', async (topic, message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                logMessage(`Gelen topic: ${topic}`);
                logMessage(`İşlenen mesaj: ${message.toString()}`);

                const normalizedTopic = topic.trim().toLowerCase();
                logMessage(`Normalized topic: ${normalizedTopic}`);

                switch (normalizedTopic) {
                    case 'machines/card':
                        logMessage('Kart mesajı işleniyor');
                        await handleCardCheck(parsedMessage);
                        break;
                    case 'machines/register':
                        logMessage('Kayıt mesajı işleniyor');
                        await handleRegister(parsedMessage);
                        break;
                    case 'machines/heartbeat':
                        logMessage('Heartbeat mesajı işleniyor');
                        await handleHeartbeat(parsedMessage);
                        break;
                    case 'machines/delivery/request':
                        logMessage('Teslimat mesajı işleniyor');
                        await handleProductDeliveryRequest(parsedMessage);
                        break;
                    default:
                        logMessage(`Bilinmeyen topic: ${normalizedTopic}`);
                        break;
                }
            } catch (error) {
                logMessage(`Mesaj işlenirken hata oluştu: ${error.message}`);
            }
        });
    } else {
        logMessage('MQTT Client zaten başlatıldı, tekrar başlatılmıyor.');
    }
}

module.exports = {
    start,
    client,
};
