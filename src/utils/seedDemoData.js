// Klasör: src/utils
// Dosya: seedDemoData.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { faker } = require('@faker-js/faker'); // Yeni faker importu
const Machine = require('../models/machines'); // Makine modelini import ettik

// Türkçe veri oluşturma
faker.locale = 'tr';

const modelsPath = path.join(__dirname, '../models');

async function seedDemoData(Model, modelName) {
    try {
        console.log(`${modelName} için demo veriler oluşturuluyor...`);

        // Veritabanını sıfırla
        await Model.deleteMany({});
        console.log(`${modelName} için mevcut veriler silindi.`);

        // Yeni model için demo veriler oluşturma
        const demoData = [];
        for (let i = 0; i < 5; i++) {
            const instance = {};
            const schemaPaths = Model.schema.paths;

            for (let key in schemaPaths) {
                if (key === '_id' || key === '__v') continue; // _id ve __v alanlarını atla

                const fieldType = schemaPaths[key].instance;
                switch (fieldType) {
                    case 'String':
                        if (key === 'serialNumber') {
                            instance[key] = faker.number.int({ min: 1000000000000000, max: 9999999999999999 }).toString();
                        } else if (key === 'status') {
                            instance[key] = faker.helpers.arrayElement(['online', 'offline', 'faulty', 'unregistered']);
                        } else if (key === 'category') {
                            instance[key] = faker.helpers.arrayElement(['İş Eldiveni', 'İş Güvenliği Gözlüğü', 'Baret', 'Koruyucu Maske', 'Güvenlik Ayakkabısı']);
                        } else if (key === 'ad') {
                            instance[key] = faker.person.firstName();
                        } else if (key === 'soyad') {
                            instance[key] = faker.person.lastName();
                        } else if (key === 'telefon') {
                            instance[key] = faker.phone.number('+90 ### ### ## ##');
                        } else if (key === 'eposta') {
                            instance[key] = faker.internet.email();
                        } else if (key === 'adres') {
                            instance[key] = faker.location.streetAddress();
                        } else if (key === 'il') {
                            instance[key] = faker.location.city();
                        } else if (key === 'ilce') {
                            instance[key] = faker.location.county();
                        } else if (key === 'semt') {
                            instance[key] = faker.location.street();
                        } else {
                            instance[key] = faker.lorem.word();
                        }
                        break;
                    case 'Number':
                        instance[key] = faker.number.int({ min: 1, max: 100 });
                        break;
                    case 'Date':
                        instance[key] = faker.date.past();
                        break;
                    case 'Boolean':
                        instance[key] = faker.datatype.boolean();
                        break;
                    default:
                        instance[key] = null;
                }
            }

            // Eğer model "Reel" ise, machineId'yi ilişkilendir
            if (modelName === 'reel') {
                const machine = await Machine.findOne();
                if (!machine) {
                    console.error('Makine verisi bulunamadı, lütfen önce makine demo verilerini oluşturun.');
                    return;
                }
                instance['machineId'] = machine._id;
                instance['serialNumber'] = faker.number.int({ min: 100000, max: 999999 }).toString(); // Makaralar için örnek seri numarası
                instance['productCount'] = 156; // Her makara 156 ürün içeriyor olarak ayarlanabilir
                instance['isActive'] = true; // Varsayılan olarak makara aktif
            }

            demoData.push(instance);
        }

        await Model.insertMany(demoData);
        console.log(`${modelName} için demo veriler başarıyla eklendi`);

    } catch (error) {
        console.error('Demo veriler oluşturulurken hata:', error);
    }
}

async function main() {
    try {
        await mongoose.connect('mongodb://localhost:27017/firma_yonetimi');
        console.log('MongoDB bağlantısı başarılı');

        const modelFiles = fs.readdirSync(modelsPath);
        for (const file of modelFiles) {
            const modelName = path.basename(file, '.js');
            const Model = require(path.join(modelsPath, file));
            await seedDemoData(Model, modelName);
        }
    } catch (error) {
        console.error('Veritabanına bağlanırken hata oluştu:', error);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB bağlantısı kapatıldı');
    }
}

// Models klasörünü izlemek için chokidar kullanımı
chokidar.watch(modelsPath).on('add', (filePath) => {
    const modelName = path.basename(filePath, '.js');
    const Model = require(filePath);
    console.log(`${modelName} modeli algılandı, demo veriler oluşturuluyor...`);
    seedDemoData(Model, modelName);
});

if (require.main === module) {
    main();
}
