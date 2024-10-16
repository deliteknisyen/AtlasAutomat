// Klasör: src/utils
// Dosya: dateFormatter.js

/**
 * ISO 8601 tarih string'ini "gün:ay:yıl saat:dakika:saniye" formatına çevirir
 * @param {String} isoDateString ISO formatındaki tarih string'i
 * @returns {String} Formatlanmış tarih string'i
 */
function formatDate(isoDateString) {
    const date = new Date(isoDateString); // ISO tarihini Date objesine çeviriyoruz

    // Gün, Ay, Yıl, Saat, Dakika ve Saniye bilgilerini alıyoruz
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay değeri 0-11 arasında olduğu için +1 yapıyoruz
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // "gün:ay:yıl saat:dakika:saniye" formatında birleştiriyoruz
    return `${day}:${month}:${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
    formatDate,
};
