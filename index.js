require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const yml = require('./modules/loc.js');
const config = require('./config.json');
const db = require('./modules/database.js');
const c = require('ansi-colors');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function worker(x) {
  while (true) {
    await delay(x * 5000);
    await doTranslate(x);
  }
}

async function main() {
  console.log(c.bold.green("🚀 HELLO WORLD"));
  const paralel = Math.max(1, config.ParalelRun - 1);
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

async function doTranslate(x) {
  const lastfile = await db.GetLastFileNAME();
  console.log(c.cyan(`🔄 [${x}] Started file: ${c.bold(lastfile)}`));
  var text = await db.filedownload(lastfile);
  const originalText = text;
  await db.filedelete(lastfile);
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
    throw e;
  }
  console.log(c.blue(`⬆️ Files uploading: ${lastfile}`));
  await db.filedelete("translated_" + lastfile);
  await db.fileupload("translated_" + lastfile, text);
  console.log(c.green(`✅ Files uploaded: ${lastfile}`));
}