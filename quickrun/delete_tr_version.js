require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');
const c = require('ansi-colors');

async function main() {
    console.log(c.blue("📋 Veritabanındaki dosya listesi alınıyor..."));
    const dbDosyalar = await db.GiveAllFileNames();
    console.log(c.blue(`✅ Veritabanında ${c.bold(dbDosyalar.length)} dosya bulundu.`));
    
    const files = fs.readdirSync("../en");
    let silinenDosya = 0;
    let bulunmayanDosya = 0;
    let hatalıDosya = 0;

    console.log(c.cyan(`📂 Toplam ${c.bold(files.length)} dosya için işlem yapılacak.`));
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const translatedFile = "translated_" + file;
        
        try {
             if (dbDosyalar.includes(translatedFile)) {
                await db.filedelete(translatedFile);
                silinenDosya++;
                console.log(c.green(`🗑️ Dosya ${c.bold(translatedFile)} silindi. ${c.cyan(files.length - i - 1)} dosya kaldı.`));
            } else {
                console.log(c.yellow(`⏩ Dosya ${c.bold(translatedFile)} veritabanında bulunamadı, atlandı. ${c.cyan(files.length - i - 1)} dosya kaldı.`));
                bulunmayanDosya++;
            }
        } catch (error) {
            console.error(c.red(`❌ Hata: ${translatedFile} dosyası silinirken bir sorun oluştu.`), error);
            hatalıDosya++;
        }
    }
    
    console.log(c.bold(`\n📊 Sonuç: ${c.green(silinenDosya)} dosya silindi, ${c.yellow(bulunmayanDosya)} dosya bulunamadı, ${c.red(hatalıDosya)} dosya işlenemedi.`));
}

main().catch(err => console.error(c.bgRed.white(`🔴 Genel Hata: ${err}`)));
