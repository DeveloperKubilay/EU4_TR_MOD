require('dotenv').config();
const chunkProcess = require('./modules/chunkProcess.js');
const yml = require('./modules/loc.js');
const config = require('./config.json');
const fs = require('fs');
const db = require('./modules/database.js');

async function main() {
  var runs = [];
  for (var i = 0; i < config.ParalelRun; i++) {
    runs.push(doTranslate());
  }
  await Promise.all(runs);


}
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

async function doTranslate() {
  const lastfile = await db.GetLastFileNAME();
  var text = await db.filedownload(lastfile);
  await db.filedelete(lastfile);
  const Ydb = new yml(text)
  try {
    text = await chunkProcess(Ydb);
  } catch (e) {
    console.log("index:30",e)
  }
  await db.fileupload(lastfile, text);
}