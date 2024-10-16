// Klasör: src/mqttHandlers
// Dosya: handleLowStock.js

const Reel = require('../models/reel');
const Notification = require('../models/notification');
const { sendEmail } = require('../utils/email');
const logMessage = require('../utils/logMessage');

/**
 * handleLowStockMessage - Kritik stok seviyesini izler ve gerekli uyarıları yapar
 * @param {Object} parsedMessage - MQTT ile gelen mesaj, JSON formatında
 */
async function handleLowStockMessage(parsedMessage) {
    const { serialNumber, productCount } = parsedMessage;

    // Seri numarası ve ürün sayısı kontrol ediliyor
    if (!serialNumber || productCount === undefined) {
        logMessage(`Geçersiz veri: ${JSON.stringify(parsedMessage)}`);
        return;
    }

    try {
        // Makara (Reel) bulma işlemi
        const reel = await Reel.findOne({ serialNumber });
        if (!reel) {
            logMessage(`Makara bulunamadı: Seri Numarası - ${serialNumber}`);
            return;
        }

        // Kritik stok seviyesi kontrolü
        if (reel.productCount <= reel.reorderLevel) {
            logMessage(`Kritik stok seviyesi uyarısı: Seri Numarası - ${serialNumber}, Kalan Ürün: ${reel.productCount}`);

            // Bildirim oluşturma
            await Notification.create({
                machineId: reel.machineId,
                message: `Makara ${serialNumber} kritik stok seviyesine ulaştı: ${reel.productCount} ürün kaldı.`,
                timestamp: new Date(),
            });

            // E-posta ile uyarı gönderme
            sendEmail({
                to: 'teknik@atlasotomasyon.com',
                subject: `Kritik Stok Uyarısı: Makara ${serialNumber}`,
                text: `Makara ${serialNumber}, kritik stok seviyesine ulaştı. Kalan ürün sayısı: ${reel.productCount}. Lütfen ürünleri doldurun.`,
            });
        } else {
            logMessage(`Stok seviyesi yeterli: Seri Numarası - ${serialNumber}, Kalan Ürün: ${reel.productCount}`);
        }

    } catch (error) {
        logMessage(`Stok kontrol işlemi sırasında hata oluştu: ${error.message}`);
    }
}

module.exports = {
    handleLowStockMessage,
};
