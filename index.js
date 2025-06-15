require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const yml = require('./modules/loc.js');
const config = require('./config.json');
const db = require('./modules/database.js'); // database_fixed.js modülünü kullanıyoruz
const c = require('ansi-colors');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limit hatası için takip sistemi
const rateLimitTracker = {
  isRateLimited: false,
  cooldownTime: 0,
  setCooldown: function(minutes = 5) {
    this.isRateLimited = true;
    this.cooldownTime = Date.now() + (minutes * 60 * 1000);
    console.log(c.yellow(`⚠️ Rate limit durumu tespit edildi, ${minutes} dakika bekleniyor...`));
  },
  checkCooldown: function() {
    if (!this.isRateLimited) return false;
    
    if (Date.now() > this.cooldownTime) {
      this.isRateLimited = false;
      console.log(c.green("✅ Rate limit bekleme süresi tamamlandı, işlemler devam edebilir."));
      return false;
    }
    
    const remainingSecs = Math.ceil((this.cooldownTime - Date.now()) / 1000);
    return remainingSecs;
  }
};

async function worker(workerId) {
  while (true) {
    try {
      // Rate limit kontrolü
      const cooldown = rateLimitTracker.checkCooldown();
      if (cooldown) {
        console.log(c.yellow(`⏸️ [${workerId}] Rate limit bekleniyor, kalan süre: ${cooldown} saniye`));
        await delay(30000); // 30 saniye bekle ve tekrar kontrol et
        continue;
      }
      
      await doTranslate(workerId);
      // Çok hızlı arka arkaya sorguları önlemek için kısa bir bekleme
      await delay(500);
    } catch (err) {
      // Rate limit hatası mı kontrol et
      if (err?.message?.includes('429') || 
          err?.message?.includes('Too Many Requests') || 
          err?.message?.includes('RESOURCE_EXHAUSTED')) {
        rateLimitTracker.setCooldown(5); // 5 dakika bekleme
        await delay(5000);
        continue;
      }
      
      // Dosya bulunamazsa veya tüm dosyalar işleniyorsa biraz bekleyelim
      console.log(c.yellow(`⏸️ [${workerId}] İşlenecek dosya bulunamadı veya hata oluştu, bekleniyor...`));
      await delay(5000); // 5 saniye bekle ve tekrar dene
    }
  }
}

async function main() {
  console.log(c.bold.green("🚀 HELLO WORLD"));
  const paralel = Math.max(1, config.ParalelRun);
  const workers = [];
  
  for (let i = 1; i <= paralel; i++) {
    workers.push(worker(i));
  }
  
  await Promise.all(workers);
}

main().catch(err => {
  console.error(c.red('❌ Error:', err));
  process.exit(1);
});

async function doTranslate(workerId) {
  // Her worker'ın farklı bir dosya almasını sağladık
  const lastfile = await db.GetLastFileNAME();
  console.log(c.cyan(`🔄 [${workerId}] Started file: ${c.bold(lastfile)}`));
  
  var text = await db.filedownload(lastfile);
  const originalText = text;
  
  try {
    text = await chunkProcess(text);
    text = text
      .replace(/ş/g,"þ")
      .replace(/Ş/g,"Þ")
      .replace(/ğ/g,"ð")
      .replace(/Ğ/g,"Ð")
      .replace(/ı/g,"ý")
      .replace(/İ/g,"Ý");
      
    if (text === originalText) {
      throw new Error("Çeviri işlemi başarısız oldu - metin değişmedi");
    }
  } catch (e) {
    console.log(c.red(`❌ ERR index.js - ${lastfile} için çeviri başarısız oldu`), e);
    await db.filedelete(lastfile); // Dosyayı silip işlenme durumunu temizleyelim ki başka worker deneyebilsin
    throw e;
  }
  
  console.log(c.blue(`⬆️ [${workerId}] Files uploading: ${lastfile}`));
  await db.filedelete(lastfile);
  await db.fileupload("translated_" + lastfile, text);
  console.log(c.green(`✅ [${workerId}] Files uploaded: ${lastfile}`));
}
