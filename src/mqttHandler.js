// Klasör: src/mqttHandler.js

const mqtt = require('mqtt');
const { logMessage, logError } = require('./utils/logger');

let clientInstance = null;  // Global MQTT client instance

// MQTT Client'i başlatma (Singleton Desen)
function start() {
    if (!clientInstance) {
        logMessage('MQTT işlemleri başlatılıyor...');

        const mqttOptions = {
            clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
            clean: true,
            reconnectPeriod: 1000,
        };

        clientInstance = mqtt.connect('mqtt://154.53.160.79', mqttOptions);

        clientInstance.on('connect', () => {
            logMessage('MQTT Broker bağlantısı başarılı');
            clientInstance.subscribe([
                'machines/card',
                'machines/register',
                'machines/heartbeat',
                'machines/delivery/request',
            ], (err) => {
                if (err) {
                    logError('Abonelik hatası: ' + err.message);
                } else {
                    logMessage('Başarıyla abone olundu');
                }
            });
        });

        clientInstance.on('message', async (topic, message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                logMessage(`Gelen topic: ${topic}`);
                logMessage(`İşlenen mesaj: ${message.toString()}`);

                const normalizedTopic = topic.trim().toLowerCase();
                logMessage(`Normalized topic: ${normalizedTopic}`);

                // İmportlar burada yapılıyor, döngüsel bağımlılık oluşmuyor
                const handleCardCheck = require('./mqttHandlers/handleCard').handleCardMessage;
                const handleRegister = require('./mqttHandlers/handleRegister');
                const handleHeartbeat = require('./mqttHandlers/handleHeartbeat').handleHeartbeatMessage;
                const handleProductDeliveryRequest = require('./mqttHandlers/productDeliveryHandler');

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
                        logError(`Bilinmeyen topic: ${normalizedTopic}`);
                        break;
                }
            } catch (error) {
                logError(`Mesaj işlenirken hata oluştu: ${error.message}`);
            }
        });
    } else {
        logMessage('MQTT Client zaten başlatıldı, tekrar başlatılmıyor.');
    }
}

// MQTT client instance'ını almak için (Bu sadece start çağrıldıktan sonra çalışacak)
function getMqttClient() {
    if (!clientInstance) {
        logError('MQTT Client henüz başlatılmadı');
    }
    return clientInstance;
}

module.exports = {
    start,
    getMqttClient,  // Client objesini döndüren fonksiyon
};
