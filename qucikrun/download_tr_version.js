require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');

async function main() {
    if (!fs.existsSync("../tr")) {
        fs.mkdirSync("../tr", { recursive: true });
        console.log("📁 TR klasörü oluşturuldu!");
    }

    const names = await db.GiveAllFileNames();
    console.log(names)
    console.log(`📂 Toplam ${names.length} dosya bulundu!`);
    console.log("📋 Dosya listesi alındı!");

    let indirilenDosyaSayisi = 0;
    let hatalıDosyaSayisi = 0;

    const translatedFiles = names.filter(name => name.startsWith("translated_"));
    console.log(`🔍 Toplam ${translatedFiles.length} adet çevirisi hazır dosya bulundu!`);

    for (let i = 0; i < translatedFiles.length; i++) {
        const translatedFile = translatedFiles[i];
        const originalFile = translatedFile.replace("translated_", "");
        const turkishFile = originalFile.replace("english", "turkish");
        
        try {
            const content = await db.filedownload(translatedFile);
            
            if (content) {
                fs.writeFileSync(`../tr/${turkishFile}`, content);
                indirilenDosyaSayisi++;
                console.log(`✅ İndirildi: ${turkishFile}`);
            } else {
                console.log(`⚠️ İçerik boş: ${translatedFile}`);
                hatalıDosyaSayisi++;
            }
        } catch (error) {
            console.error(`❌ Hata: ${translatedFile}`);
            hatalıDosyaSayisi++;
        }
    }
    
    console.log(`\n📊 Sonuç: ${indirilenDosyaSayisi} dosya indirildi, ${hatalıDosyaSayisi} dosya indirilemedi.`);
}

main().catch(err => console.error(`🔴 Hata: ${err}`));