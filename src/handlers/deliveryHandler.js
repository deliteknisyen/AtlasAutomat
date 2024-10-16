// Klasör: src/handlers
// Dosya: deliveryHandler.js

const Machine = require('../models/machine');
const Reel = require('../models/reel');  // reel yerine Reel modeli kullanılıyor
const DeliveryLog = require('../models/deliveryLog');
const SalesLog = require('../models/salesLog');

const { logMessage, logError, logWarning } = require('../utils/logger');
const client = require('../mqttHandler').client;

/**
 * handleProductDeliveryRequest - Ürün teslimat talebini işleyen fonksiyon
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleProductDeliveryRequest(parsedMessage) {
    const { serialNumber, cardID, compartmentNumber } = parsedMessage;

    // Seri numarası ve kart ID'si eksikse hatayı bildir
    if (!serialNumber || !cardID) {
        logMessage(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`);
        client.publish('machines/error', JSON.stringify({ serialNumber, status: 'failed', message: 'Geçersiz veri' }));
        return;
    }

    try {
        // Makineyi bul ve 'reels' ile 'product' alanlarını da getir
        const machine = await Machine.findOne({ serialNumber }).populate({
            path: 'reels',
            populate: { path: 'product' }  // Ürün referanslarını da dahil et
        });

        if (!machine) {
            logMessage(`Makine bulunamadı: Seri Numarası - ${serialNumber}`);
            client.publish('machines/delivery/response', JSON.stringify({ serialNumber, status: 'failed', message: 'Makine bulunamadı' }));
            return;
        }

        // Aktif ve dolu bir makara bul
        const activeReel = machine.reels.find(reel => reel.isActive && reel.productCount > 0);
        if (!activeReel) {
            logMessage(`Makine (${serialNumber}) için dolu makara bulunamadı.`);
            client.publish('machines/delivery/response', JSON.stringify({ serialNumber, status: 'failed', message: 'Dolu makara yok' }));
            return;
        }

        // Geçerli bölme numarasını kontrol et
        if (compartmentNumber < 0 || activeReel.compartments[compartmentNumber] === false) {
            logMessage(`Geçersiz bölme numarası: ${compartmentNumber} veya bölme zaten boş.`);
            client.publish('machines/delivery/response', JSON.stringify({
                serialNumber,
                status: 'failed',
                message: `Geçersiz bölme numarası: ${compartmentNumber}`
            }));
            return;
        }

        const product = activeReel.product;

        if (!product || !product.salePrice) {
            logMessage(`Ürünün satış fiyatı bulunamadı: Makara - ${activeReel.serialNumber}`);
            client.publish('machines/delivery/response', JSON.stringify({ serialNumber, status: 'failed', message: 'Satış fiyatı bulunamadı' }));
            return;
        }

        // Ürün sayısını azalt ve reel kaydet
        activeReel.productCount -= 1;
        activeReel.compartments[compartmentNumber] = false; // Bölmeyi boş olarak işaretle
        await activeReel.save();

        // Kritik stok uyarısı
        if (activeReel.productCount <= activeReel.reorderLevel) {
            logMessage(`Kritik stok seviyesi uyarısı: ${activeReel.serialNumber}`);
            notificationService.sendNotification({
                to: "depo@firma.com",
                subject: `Kritik Stok Uyarısı: ${activeReel.serialNumber}`,
                text: `Makine ${serialNumber} üzerindeki makara ${activeReel.serialNumber} kritik stok seviyesine ulaştı.`
            });
        }

        // Teslimat log'u oluştur
        await DeliveryLog.create({
            reelId: activeReel._id,
            compartmentNumber: compartmentNumber,
            cardId: cardID,
            timestamp: new Date(),
        });

        // Satış log'u oluştur
        await SalesLog.create({
            reelId: activeReel._id,
            productId: product._id, // Ürün ID'si
            compartmentNumber: compartmentNumber,
            cardId: cardID,
            salePrice: product.salePrice, // Makinedeki satış fiyatı
            timestamp: new Date(),
        });

        // MQTT ile başarılı teslimat yanıtı gönder
        logMessage(`Teslimat başarılı: Makara - ${activeReel.serialNumber}, Bölme numarası - ${compartmentNumber}`);
        client.publish('machines/delivery/response', JSON.stringify({
            serialNumber,
            reelSerialNumber: activeReel.serialNumber,
            remainingProductCount: activeReel.productCount,
            compartmentNumber: compartmentNumber,
            status: 'success'
        }));

    } catch (error) {
        logMessage(`Ürün teslim talebi işlenirken hata oluştu: ${error.message}`);
        client.publish('machines/error', JSON.stringify({ error: error.message }));
    }
}

module.exports = { handleProductDeliveryRequest };
