require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const yml = require('./modules/loc.js');
const config = require('./config.json');
const fs = require('fs');
const db = require('./modules/database.js');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function main() {
  while (true) {
    console.log("HELLO WORLD")
    var runs = [];
    for (var i = 1; i < config.ParalelRun; i++) {
      runs.push(delay(i * 5000).then(() => doTranslate(i)));
    }
    await Promise.all(runs);
    console.log("BYE WORLD")
  }


}
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

async function doTranslate(x) {
  const lastfile = await db.GetLastFileNAME();
  console.log(x,"Started file: " + lastfile);
  var text = await db.filedownload(lastfile);
  await db.filedelete(lastfile);
  const Ydb = new yml(text)
  try {
    text = await chunkProcess(Ydb);
  } catch (e) {
    console.log("index:30", e)
  }
  console.log("Files uploading", lastfile);
  await db.filedelete("translated_" + lastfile);
  await db.fileupload("translated_" + lastfile, text);
  console.log("Files uploaded", lastfile)
}