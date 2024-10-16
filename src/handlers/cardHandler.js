// Klasör: src/handlers
// Dosya: cardHandler.js

const Personel = require('../models/personel'); // Personel modelini dahil ediyoruz
const logMessage = require('../utils/logger'); // Loglama fonksiyonunu dahil ediyoruz
const client = require('../mqttHandler').client; // MQTT client'ı dahil ediyoruz

/**
 * handleCardMessage - Gelen kart mesajını işler
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleCardMessage(parsedMessage) {
    const { serialNumber, cardID } = parsedMessage;

    // Gerekli bilgilerin varlığını kontrol ediyoruz
    if (!serialNumber || !cardID) {
        logMessage(`Geçersiz kart verisi: ${JSON.stringify(parsedMessage)}`);
        client.publish('machines/error', JSON.stringify({ serialNumber, status: 'failed', message: 'Geçersiz kart verisi' }));
        return;
    }

    try {
        // Kart ID'ye göre personeli arıyoruz
        const personel = await Personel.findOne({ kartID: cardID });
        if (personel) {
            logMessage(`RFID (${cardID}) Sistemde Kayıtlı: ${personel.ad} ${personel.soyad}`);
            const response = personel.urunAlmaHakki
                ? { cardID, status: 'valid_card', name: `${personel.ad} ${personel.soyad}` }
                : { cardID, status: 'invalid_card', message: 'No product rights' };

            // Kart yanıtını MQTT üzerinden gönderiyoruz
            client.publish('machines/card/response', JSON.stringify(response));
        } else {
            logMessage(`Kart (${cardID}) Sistemde bulunamadı.`);
            client.publish('machines/card/response', JSON.stringify({ cardID, status: 'invalid_card', message: 'Card not registered' }));
        }
    } catch (error) {
        logMessage(`Kart kontrol işlemi sırasında hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}


module.exports = {
    handleCardMessage,
};