// Klasör: src/mqttHandlers
// Dosya: productDeliveryHandler.js

const Machine = require('../models/machines'); // Dosya adını kontrol edin (machines.js olabilir)
const Reel = require('../models/reel');
const SalesLog = require('../models/salesLog');
const DeliveryLog = require('../models/deliveryLog');
const { logMessage, logError } = require('../utils/logger');
const { getMqttClient } = require('../mqttHandler'); // MQTT client getMqttClient ile alınıyor

/**
 * handleProductDeliveryRequest - Ürün teslimat talebini işleyen fonksiyon
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleProductDeliveryRequest(parsedMessage) {
    const { serialNumber, cardID } = parsedMessage;
    const client = getMqttClient(); // MQTT client'ı alıyoruz

    // MQTT Client kontrolü
    if (!client) {
        logError('MQTT Client mevcut değil');
        return;
    }

    // Seri numarası ve kart ID'si eksikse hatayı bildir
    if (!serialNumber || !cardID) {
        logMessage(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`, 'error');
        client.publish('machines/error', JSON.stringify({ serialNumber, status: 'failed', message: 'Geçersiz veri' }));
        return;
    }

    try {
        // Makineyi bul ve 'reels' ile 'product' alanlarını da getir
        const machine = await Machine.findOne({ serialNumber }).populate({
            path: 'reels',
            populate: { path: 'product' }  // Ürün referanslarını da dahil ediyoruz
        });

        if (!machine) {
            logMessage(`Makine bulunamadı: Seri Numarası - ${serialNumber}`, 'error');
            client.publish('machines/error', JSON.stringify({ serialNumber, status: 'failed', message: 'Makine bulunamadı' }));
            return;
        }

        // Aktif ve dolu bir makara bul
        const activeReel = machine.reels.find(reel => reel.isActive && reel.productCount > 0);
        if (!activeReel) {
            logMessage(`Makine (${serialNumber}) için dolu makara bulunamadı.`, 'error');
            client.publish('machines/delivery/response', JSON.stringify({ serialNumber, status: 'failed', message: 'Dolu makara yok' }));
            return;
        }

        const nextCompartmentNumber = activeReel.compartments.findIndex(comp => comp === true);
        if (nextCompartmentNumber === -1) {
            logMessage('Tüm bölmeler dolu, yeni ürün teslim edilemez.', 'error');
            client.publish('machines/delivery/response', JSON.stringify({ serialNumber, status: 'failed', message: 'Tüm bölmeler dolu' }));
            return;
        }

        const product = activeReel.product;

        if (!product || !product.salePrice) {
            logMessage(`Ürünün satış fiyatı bulunamadı: Makara - ${activeReel.serialNumber}`, 'error');
            client.publish('machines/delivery/response', JSON.stringify({ serialNumber, status: 'failed', message: 'Satış fiyatı bulunamadı' }));
            return;
        }

        // Ürün sayısını azalt ve reel kaydet
        activeReel.productCount -= 1;
        activeReel.compartments[nextCompartmentNumber] = false; // Bölmeyi boş olarak işaretle
        await activeReel.save();

        // Kritik stok uyarısı
        if (activeReel.productCount <= activeReel.reorderLevel) {
            logMessage(`Kritik stok seviyesi uyarısı: ${activeReel.serialNumber}`, 'warning');
            // Stok uyarısı için ek bir işlem yapılabilir (e-posta, bildirim vb.)
        }

        // Teslimat log'u oluştur
        await DeliveryLog.create({
            reelId: activeReel._id,
            compartmentNumber: nextCompartmentNumber,
            cardId: cardID,
            timestamp: new Date(),
        });

        // Satış log'u oluştur
        await SalesLog.create({
            reelId: activeReel._id,
            productId: product._id, // Ürün ID'si
            compartmentNumber: nextCompartmentNumber,
            cardId: cardID,
            salePrice: product.salePrice, // Makinedeki satış fiyatı
            timestamp: new Date(),
        });

        // MQTT ile başarılı teslimat yanıtı gönder
        logMessage(`Teslimat başarılı: Makara - ${activeReel.serialNumber}, Bölme numarası - ${nextCompartmentNumber}`, 'info');
        client.publish('machines/delivery/response', JSON.stringify({
            serialNumber,
            reelSerialNumber: activeReel.serialNumber,
            remainingProductCount: activeReel.productCount,
            compartmentNumber: nextCompartmentNumber,
            status: 'success'
        }));

    } catch (error) {
        logError(`Ürün teslim talebi işlenirken hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = handleProductDeliveryRequest;
