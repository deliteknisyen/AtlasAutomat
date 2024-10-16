const mongoose = require('mongoose');
const Reel = require('../models/reel'); // Reel modelini dahil ediyoruz
const Product = require('../models/product'); // Ürün modelini dahil ediyoruz

// MongoDB'ye bağlanma
mongoose.connect('mongodb://localhost:27017/firma_yonetimi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
    updateReelData(); // Güncelleme fonksiyonunu çağırıyoruz
}).catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
});

// Mevcut Reel verilerini güncelleme
async function updateReelData() {
    try {
        // Tüm reel verilerini getir
        const reels = await Reel.find();

        for (let reel of reels) {
            let needsUpdate = false;

            // Eğer 'compartments' boşsa varsayılan bölmeleri ekle
            if (!reel.compartments || reel.compartments.length === 0) {
                reel.compartments = Array(reel.productCount).fill(true); // Varsayılan olarak tüm bölmeler dolu
                needsUpdate = true;
            }

            // Eğer 'product' boşsa veya geçerli değilse uygun bir product ekle
            if (!reel.product) {
                const defaultProduct = await Product.findOne(); // Varsayılan bir ürün seçin
                if (defaultProduct) {
                    reel.product = defaultProduct._id;
                    needsUpdate = true;
                } else {
                    console.log(`Ürün bulunamadı, makara atlanıyor: ${reel.serialNumber}`);
                    continue;
                }
            }

            // Eğer güncelleme gerekiyorsa reel kaydını kaydet
            if (needsUpdate) {
                await reel.save();
                console.log(`Reel güncellendi: ${reel.serialNumber}`);
            }
        }

        console.log('Tüm reel verileri başarıyla güncellendi.');
    } catch (error) {
        console.error('Veri güncelleme sırasında hata oluştu:', error);
    } finally {
        mongoose.connection.close(); // Bağlantıyı kapat
    }
}
