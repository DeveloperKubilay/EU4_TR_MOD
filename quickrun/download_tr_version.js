require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');
const c = require('ansi-colors');

async function main() {
    if (!fs.existsSync("../tr")) {
        fs.mkdirSync("../tr", { recursive: true });
        console.log(c.green("📁 TR klasörü oluşturuldu!"));
    }

    const names = await db.GiveAllFileNames();
    console.log(names)
    console.log(c.cyan(`📂 Toplam ${c.bold(names.length)} dosya bulundu!`));
    console.log(c.blue("📋 Dosya listesi alındı!"));

    let indirilenDosyaSayisi = 0;
    let hatalıDosyaSayisi = 0;

    const translatedFiles = names.filter(name => name.startsWith("translated_"));
    console.log(c.magenta(`🔍 Toplam ${c.bold(translatedFiles.length)} adet çevirisi hazır dosya bulundu!`));

    const mainpath = process.env.build ? "../modules/Mod_template/locations/" : "../tr/"
    fs.mkdirSync("../modules/Mod_template/locations/", { recursive: true });

    for (let i = 0; i < translatedFiles.length; i++) {
        const translatedFile = translatedFiles[i];
        const originalFile = translatedFile.replace("translated_", "");
        const turkishFile = originalFile.replace("english", "turkish");
        
        try {
            const content = await db.filedownload(translatedFile);
            
            if (content) {
                fs.writeFileSync(`${mainpath}${turkishFile}`, content);
                indirilenDosyaSayisi++;
                console.log(c.green(`✅ İndirildi: ${turkishFile}`));
            } else {
                console.log(c.yellow(`⚠️ İçerik boş: ${translatedFile}`));
                hatalıDosyaSayisi++;
            }
        } catch (error) {
            console.error(c.red(`❌ Hata: ${translatedFile}`),error);
            hatalıDosyaSayisi++;
        }
    }
    
    console.log(c.bold(`\n📊 Sonuç: ${c.green(indirilenDosyaSayisi)} dosya indirildi, ${c.red(hatalıDosyaSayisi)} dosya indirilemedi.`));
}

main().catch(err => console.error(c.bgRed.white(`🔴 Hata: ${err}`)));