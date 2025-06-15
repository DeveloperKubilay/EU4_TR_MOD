require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const yml = require('./modules/loc.js');
const config = require('./config.json');
const db = require('./modules/database.js'); // database_fixed.js modülünü kullanıyoruz
const c = require('ansi-colors');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Worker'lar arasında senkronizasyon için basit bir kilit mekanizması
const activeWorkers = {
  count: 0,
  maxActive: config.shard // Aynı anda aktif çalışabilecek maksimum worker sayısı
};

async function worker(workerId) {
  while (true) {
    try {
      // Worker'lar arası koordinasyon kontrolü
      while (activeWorkers.count >= activeWorkers.maxActive) {
        console.log(c.yellow(`⏸️ [${workerId}] Diğer worker'ları bekliyor...`));
        await delay(2000); // 2 saniye bekle ve tekrar kontrol et
      }
      
      // Worker aktif olarak işaretleniyor
      activeWorkers.count++;
      console.log(c.blue(`🟢 [${workerId}] Çalışmaya başladı - Aktif: ${activeWorkers.count}/${activeWorkers.maxActive}`));
      
      await doTranslate(workerId);
      
      // Worker işini tamamladı
      activeWorkers.count--;
      console.log(c.blue(`🔵 [${workerId}] Çalışmayı tamamladı - Aktif: ${activeWorkers.count}/${activeWorkers.maxActive}`));
      
      // Sonraki döngüye geçmeden önce biraz daha uzun bir bekleme
      await delay(2000);
    } catch (err) {
      // Hata durumunda worker sayacını azalt (hata durumunda da worker inaktif sayılmalı)
      if (activeWorkers.count > 0) {
        activeWorkers.count--;
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
  
  // Worker sayısının shard sayısından fazla olmaması için kontrol
  if (paralel > config.shard) {
    console.log(c.yellow(`⚠️ Paralel çalışan sayısı (${paralel}), shard sayısından (${config.shard}) fazla. Optimizasyon için shard sayısı kadar çalışan kullanılıyor.`));
  }
  
  for (let i = 1; i <= paralel; i++) {
    // Worker'ları kademeli olarak başlat
    setTimeout(() => {
      workers.push(worker(i));
      console.log(c.green(`🚀 Worker ${i} başlatıldı`));
    }, i * 3000); // Her worker'ı 3 saniye arayla başlat
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
