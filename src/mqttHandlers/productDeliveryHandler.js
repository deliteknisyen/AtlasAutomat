// Klasör: src/mqttHandlers
// Dosya: productDeliveryHandler.js

const Reel = require('../models/reel');
const SalesLog = require('../models/salesLog');
const DeliveryLog = require('../models/deliveryLog');
const { logMessage, logError } = require('../utils/logger');
const { getMqttClient } = require('../mqttHandler'); // MQTT client getMqttClient ile alınıyor

/**
 * handleProductDeliveryRequest - Ürün teslimat talebini işler
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleProductDeliveryRequest(parsedMessage) {
    const { serialNumber, cardID, compartmentNumber } = parsedMessage;
    const client = getMqttClient(); // MQTT client'ı alınıyor

    // MQTT Client kontrolü
    if (!client) {
        logError('MQTT Client mevcut değil');
        return;
    }

    // Veri doğrulaması
    if (!serialNumber || !cardID || compartmentNumber === undefined) {
        logError(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`);
        client.publish('machines/error', JSON.stringify({
            status: 'failed',
            message: 'Geçersiz teslimat verisi'
        }));
        return;
    }

    try {
        // Makara (Reel) ve ürünü bul
        const reel = await Reel.findOne({ serialNumber }).populate('product');

        if (!reel) {
            logError(`Makara bulunamadı: Seri Numarası - ${serialNumber}`);
            client.publish('machines/delivery/response', JSON.stringify({
                serialNumber,
                status: 'failed',
                message: 'Makara bulunamadı'
            }));
            return;
        }

        const product = reel.product;

        // Ürün ve satış fiyatı kontrolü
        if (!product || !product.salePrice) {
            logError(`Ürünün satış fiyatı bulunamadı: Makara - ${reel.serialNumber}`);
            client.publish('machines/delivery/response', JSON.stringify({
                serialNumber,
                status: 'failed',
                message: 'Satış fiyatı bulunamadı'
            }));
            return;
        }

        // Teslimat işlemi ve bölme kontrolü
        if (compartmentNumber < 0 || compartmentNumber >= reel.compartments.length || !reel.compartments[compartmentNumber]) {
            logError(`Geçersiz bölme numarası: ${compartmentNumber} veya bölme zaten boş.`);
            client.publish('machines/delivery/response', JSON.stringify({
                serialNumber,
                status: 'failed',
                message: 'Geçersiz veya boş bölme numarası'
            }));
            return;
        }

        // Ürün sayısını azalt ve bölmeyi boş işaretle
        reel.productCount -= 1;
        reel.compartments[compartmentNumber] = false;
        await reel.save();

        // Teslimat log'u oluştur
        await DeliveryLog.create({
            reelId: reel._id,
            compartmentNumber,
            cardId: cardID,
            timestamp: new Date(),
        });

        // Satış log'u oluştur
        await SalesLog.create({
            reelId: reel._id,
            productId: product._id,
            compartmentNumber,
            cardId: cardID,
            salePrice: product.salePrice,
            timestamp: new Date(),
        });

        // MQTT ile başarılı teslimat yanıtı gönder
        logMessage(`Teslimat başarılı: Makara - ${reel.serialNumber}, Bölme numarası - ${compartmentNumber}`);
        client.publish('machines/delivery/response', JSON.stringify({
            serialNumber,
            reelSerialNumber: reel.serialNumber,
            remainingProductCount: reel.productCount,
            compartmentNumber,
            status: 'success'
        }));

    } catch (error) {
        logError(`Ürün teslimat talebi işlenirken hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = handleProductDeliveryRequest;
