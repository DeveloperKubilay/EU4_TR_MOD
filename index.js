require('dotenv').config();

const fs = require('fs');
//const db = require('./modules/database.js');
const yml = require("./modules/loc.js")

async function main() {
    /*  const lastfile = await db.GetLastFileNAME();
  
      const text = await db.filedownload(lastfile);*/
    /*const text = new yml(fs.readFileSync('./en/00_lanfang_l_english.yml', 'utf8'))
        console.log(text.getList());
    fs.writeFileSync('./tr/00_lanfang_l_turkish.yml', text.toString());*/
    // await db.filedelete(lastfile);




}
main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});