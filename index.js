require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const config = require('./config.json');
const db = require('./modules/database.js');
const c = require('ansi-colors');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
var workerTry = 0;
let remainingFilesCount = 0; 

async function updateRemainingFilesCount() {
  try {
    const allFiles = await db.GiveAllFileNames();
    const pendingFiles = allFiles.filter(file => 
      !file.startsWith('translated_') && !file.startsWith('ERR_')
    );
    remainingFilesCount = pendingFiles.length;
    return remainingFilesCount;
  } catch (err) {
    console.error(c.red('❌ Kalan dosya sayısı hesaplanamadı:'), err);
    return -1;
  }
}

async function worker(workerId) {
  await updateRemainingFilesCount();
  let whilerunning = true;
  while (whilerunning) {
    try {
      await doTranslate(workerId);
      await updateRemainingFilesCount();
      await delay(500);
    } catch (err) {
      workerTry++;
      if (workerTry > 3) {
        whilerunning = false;
        console.error(c.red(`❌ [${workerId}] Çevirilicek dosya kalmadı. Çıkılıyor...`));
      }
      await delay(5000); 
    }
  }
}

async function main() {
  console.log(c.bold.green("🚀 HELLO WORLD"));
  await updateRemainingFilesCount();
  console.log(c.magenta(`📊 Toplam ${c.bold(remainingFilesCount)} dosya çevrilmeyi bekliyor...`));
  
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
  const lastfile = await db.GetLastFileNAME();
  console.log(c.cyan(`🔄 [${workerId}] Started file: ${c.bold(lastfile)} (Kalan: ${c.bold(remainingFilesCount)} dosya)`));
  
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
    await db.fileupload("ERR_" + lastfile, originalText);
    await db.filedelete(lastfile); 
    throw e;
  }
  
  console.log(c.blue(`⬆️ [${workerId}] Files uploading: ${lastfile}`));
  await db.filedelete(lastfile);
  await db.fileupload("translated_" + lastfile, text);
  console.log(c.green(`✅ [${workerId}] Files uploaded: ${lastfile}`));
}
