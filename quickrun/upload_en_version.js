require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');
const c = require('ansi-colors');

async function main() {
    console.log(c.blue("📋 Veritabanındaki dosya listesi alınıyor..."));
    const dbDosyalar = await db.GiveAllFileNames();
    console.log(c.blue(`✅ Veritabanında ${c.bold(dbDosyalar.length)} dosya bulundu.`));
    
    const files = fs.readdirSync("../en");
    let yuklenenDosya = 0;
    let atlanandosya = 0;
    let hatalıDosya = 0;

    console.log(c.cyan(`📂 Toplam ${c.bold(files.length)} dosya işlenecek.`));
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
            if (dbDosyalar.includes(file)) {
                console.log(c.yellow(`⏩ Dosya ${c.bold(file)} zaten veritabanında var, atlandı. ${c.cyan(files.length - i - 1)} dosya kaldı.`));
                atlanandosya++;
            } else {
                const localContent = fs.readFileSync(`../en/${file}`, 'utf8');
                await db.fileupload(file, localContent);
                yuklenenDosya++;
                console.log(c.green(`🚀 Dosya ${c.bold(file)} yüklendi. ${c.cyan(files.length - i - 1)} dosya kaldı.`));
            }
        } catch (error) {
            console.error(c.red(`❌ Hata: ${file} dosyası yüklenirken bir sorun oluştu.`), error);
            hatalıDosya++;
        }
    }
      console.log(c.bold(`\n📊 Sonuç: ${c.green(yuklenenDosya)} dosya yüklendi, ${c.yellow(atlanandosya)} dosya atlandı, ${c.red(hatalıDosya)} dosya işlenemedi.`));
}

main().catch(err => console.error(c.bgRed.white(`🔴 Genel Hata: ${err}`)));
