// Klasör: src/mqttHandlers
// Dosya: productDeliveryHandler.js

const Reel = require('../models/reel'); // Model ismini büyük harfle düzeltiyoruz
const SalesLog = require('../models/salesLog');
const { logMessage } = require('../utils/logMessage');
const notificationService = require('../services/notificationService');
const client = require('../mqttHandler'); // Eğer client mqttClient.js'den geliyorsa

/**
 * handleProductDeliveryRequest - Ürün teslimat talebini işler
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleProductDeliveryRequest(parsedMessage) {
    const { serialNumber, cardID, compartmentNumber } = parsedMessage;

    try {
        // Makineyi ve ilgili makarayı bulalım
        const reel = await Reel.findOne({ serialNumber }).populate('product'); // RegExp kullanmadan, serialNumber'i direkt arıyoruz

        if (!reel) {
            logMessage(`Makara bulunamadı: Seri Numarası - ${serialNumber}`);
            return;
        }

        const product = reel.product;

        // Ürün bulunamadıysa veya ürünün `salePrice` bilgisi yoksa hata döndür
        if (!product || !product.salePrice) {
            logMessage(`Ürünün satış fiyatı bulunamadı: Makara - ${reel.serialNumber}`);
            return;
        }

        // Compartment numarası kontrolü: Geçerli bir bölme olup olmadığını kontrol ediyoruz
        if (compartmentNumber < 0 || compartmentNumber >= reel.compartments.length || !reel.compartments[compartmentNumber]) {
            logMessage(`Geçersiz bölme numarası: ${compartmentNumber} veya bölme zaten boş.`);
            return;
        }

        // Ürün teslimat işlemini burada işliyoruz
        logMessage(`Ürün teslim ediliyor: ${product.productName}, Fiyat: ${product.salePrice}`);

        // Bölme boş olarak işaretleniyor
        reel.compartments[compartmentNumber] = false;
        reel.productCount -= 1;
        await reel.save(); // Makara güncelleniyor

        // Kritik stok seviyesi kontrolü
        if (reel.productCount <= reel.reorderLevel) {
            logMessage(`Kritik stok seviyesi uyarısı: ${reel.serialNumber}`);
            notificationService.sendNotification({
                to: "depo@firma.com",
                subject: `Kritik Stok Uyarısı: ${reel.serialNumber}`,
                text: `Makine ${serialNumber} üzerindeki makara ${reel.serialNumber} kritik stok seviyesine ulaştı.`
            });
        }

        // Satış loguna kaydediyoruz
        await SalesLog.create({
            reelId: reel._id,
            productId: product._id,
            compartmentNumber: compartmentNumber,
            cardId: cardID,
            salePrice: product.salePrice,
            timestamp: new Date(),
        });

        logMessage(`Teslimat başarılı: ${product.productName}, Bölme numarası: ${compartmentNumber}`);
    } catch (error) {
        logMessage(`Ürün teslimat talebi işlenirken hata oluştu: ${error.message}`);
    }
}

module.exports = handleProductDeliveryRequest;
