// Klasör: src/mqttHandlers/handleCard.js
const { getClient } = require('../mqttHandler');
const Personel = require('../models/personel');
const { logMessage } = require('../utils/logger');

async function handleCardCheck(parsedMessage) {
    const { serialNumber, cardID } = parsedMessage;
    const client = getClient();  // getClient() ile client'a erişiyoruz

    if (!serialNumber || !cardID) {
        logMessage(`Geçersiz kart verisi: ${JSON.stringify(parsedMessage)}`);
        client.publish('machines/card/response', JSON.stringify({
            status: 'failed',
            message: 'Geçersiz kart verisi',
        }));
        return;
    }

    try {
        const personel = await Personel.findOne({ kartID: cardID });
        if (!personel) {
            logMessage(`Kart bulunamadı: Kart ID - ${cardID}`);
            client.publish('machines/card/response', JSON.stringify({
                cardID,
                status: 'invalid_card',
                message: 'Kart bulunamadı',
            }));
            return;
        }

        if (personel.urunAlmaHakki) {
            logMessage(`RFID Kart geçerli: ${personel.ad} ${personel.soyad}`);
            client.publish('machines/card/response', JSON.stringify({
                cardID,
                status: 'valid_card',
                name: `${personel.ad} ${personel.soyad}`,
            }));
        } else {
            logMessage(`Kart geçersiz: ${personel.ad} ${personel.soyad} - Ürün alma hakkı yok`);
            client.publish('machines/card/response', JSON.stringify({
                cardID,
                status: 'invalid_card',
                message: 'Ürün alma hakkı yok',
            }));
        }

    } catch (error) {
        logMessage(`Kart kontrol sırasında hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({
            status: 'error',
            message: error.message,
        }));
    }
}

module.exports = handleCardCheck;
