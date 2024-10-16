// Klasör: src/mqttHandlers
// Dosya: handleLowStock.js

const Reel = require('../models/reel'); // Reel modelini dahil ediyoruz
const { logMessage, logError } = require('../utils/logger'); // Loglama fonksiyonlarını dahil ediyoruz
const Notification = require('../models/notification'); // Notification modeli
const { sendEmail } = require('../utils/email'); // E-posta gönderimi için gerekli fonksiyon

/**
 * handleLowStockMessage - Düşük stok seviyesini işler ve uyarılar gönderir
 * @param {Object} parsedMessage - MQTT ile gelen düşük stok mesajı, JSON formatında
 */
async function handleLowStockMessage(parsedMessage) {
    const { serialNumber, reelId } = parsedMessage;

    // Seri numarası ve makara ID kontrolü
    if (!serialNumber || !reelId) {
        logError(`Geçersiz düşük stok verisi: ${JSON.stringify(parsedMessage)}`);
        return;
    }

    try {
        // İlgili makarayı bul
        const reel = await Reel.findOne({ serialNumber, _id: reelId }).populate('product');
        if (!reel) {
            logError(`Makara bulunamadı: Seri Numarası - ${serialNumber}, Reel ID - ${reelId}`);
            return;
        }

        // Ürün bilgisi mevcut mu kontrol ediliyor
        const product = reel.product;
        if (!product) {
            logError(`Makara üzerinde ürün bilgisi bulunamadı: Seri Numarası - ${serialNumber}, Reel ID - ${reelId}`);
            return;
        }

        // Kritik stok seviyesi kontrol ediliyor
        if (reel.productCount <= reel.reorderLevel) {
            logMessage(`Düşük stok seviyesi tespit edildi: ${product.productName} (${reel.productCount} adet kaldı)`);

            // Bildirim oluştur
            await Notification.create({
                reelId: reel._id,
                message: `Ürün ${product.productName} stok seviyesi kritik seviyede (${reel.productCount} adet kaldı).`,
                timestamp: new Date(),
            });

            // Teknik personele e-posta bildirimi gönder
            await sendEmail({
                to: 'depo@firma.com',
                subject: `Düşük Stok Uyarısı: ${product.productName}`,
                text: `Makine ${serialNumber} üzerindeki makara ${reel.serialNumber} kritik stok seviyesine ulaştı. Ürün: ${product.productName}, Kalan Adet: ${reel.productCount}`,
            });

            logMessage(`Düşük stok uyarısı ve e-posta gönderildi: ${product.productName}`);
        }
    } catch (error) {
        logError(`Düşük stok işlemi sırasında hata oluştu: ${error.message}`);
    }
}

module.exports = {
    handleLowStockMessage,
};
