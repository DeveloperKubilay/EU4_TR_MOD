require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const yml = require('./modules/loc.js');
const config = require('./config.json');
const db = require('./modules/database.js');
const c = require('ansi-colors');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  while (true) {
    console.log(c.bold.green("🚀 HELLO WORLD"));
    var runs = [];
    for (var i = 1; i < config.ParalelRun; i++) {
      runs.push(delay(i * 5000).then(() => doTranslate(i)));
    }
    await Promise.all(runs);
    console.log(c.bold.yellow("👋 BYE WORLD"));
  }


}
main().catch(err => {
  console.error(c.red('❌ Error:', err));
  process.exit(1);
});

async function doTranslate(x) {
  const lastfile = await db.GetLastFileNAME();
  console.log(c.cyan(`🔄 [${x}] Started file: ${c.bold(lastfile)}`));
  var text = await db.filedownload(lastfile);
  await db.filedelete(lastfile);
  const Ydb = new yml(text)
  try {
    text = (await chunkProcess(Ydb))
    .replace("ş","þ")
    .replace("Ş","Þ")
    .replace("ğ","ð")
    .replace("Ğ","Ð")
    .replace("ı","ý")
    .replace("İ","Ý")
  } catch (e) {
    console.log(c.red("❌ ERR index:43"),e)
  }
  console.log(c.blue(`⬆️ Files uploading: ${lastfile}`));
  await db.filedelete("translated_" + lastfile);
  await db.fileupload("translated_" + lastfile, text);
  console.log(c.green(`✅ Files uploaded: ${lastfile}`));
}