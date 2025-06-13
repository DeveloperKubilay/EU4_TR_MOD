require('dotenv').config();
const config = require('./config.json');

const fs = require('fs');
//const db = require('./modules/database.js');
const yml = require("./modules/loc.js")
const ai = require('./modules/ai.js');

async function main() {
    /*  const lastfile = await db.GetLastFileNAME();
      const text = await db.filedownload(lastfile);
      await db.filedelete(lastfile);*/
    const text = new yml(fs.readFileSync('./en/00_lanfang_l_english.yml', 'utf8'))

    const allItems = text.getList();
    for (let i = 0; i < allItems.length; i += config.chunkSize) {
        const chunk = allItems.slice(i, i + config.chunkSize).join("\n");
        console.log(`Processing chunk ${Math.floor(i / config.chunkSize) + 1} of ${Math.ceil(allItems.length / config.chunkSize)}`);
        const text = await ai(config.promt.join("\n").replace("{DATA}", chunk))
        console.log(text)
        process.exit(0)
    }

   // fs.writeFileSync('./tr/00_lanfang_l_turkish.yml', text.toString());

}
main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});