require('dotenv').config();
const config = require('./config.json');

const fs = require('fs');
//const db = require('./modules/database.js');
const yml = require("./modules/loc.js")
const ai = require('./modules/ai.js');

async function processText(chunk) {
    const text = new yml(await ai(config.promt.join("\n").replace("{DATA}", chunk)), true);
    return " " + text.getList().join(" ")
}

async function main() {
    /*  const lastfile = await db.GetLastFileNAME();
      const text = await db.filedownload(lastfile);
      await db.filedelete(lastfile);*/
    const text = new yml(fs.readFileSync('./en/00_lanfang_l_english.yml', 'utf8'))


    var tempText = "l_turkish:\n"

    const allItems = text.getList();
    const chunks = [[]]
    for (let i = 0; i < allItems.length; i += config.chunkSize) {
        const chunk = allItems.slice(i, i + config.chunkSize).join("")
        console.log(chunks[chunks.length - 1].length, config.shard)
        if (chunks[chunks.length - 1].length >= config.shard) {
            chunks.push([processText(chunk)]);
        } else chunks[chunks.length - 1].push(processText(chunk));
    }

    for (const chunk of chunks) {
        const [...data] = await Promise.all(chunk)
        data.forEach(data => {
            tempText += data
        })
    }


    fs.writeFileSync('./tr/00_lanfang_l_turkish.yml', tempText);

}
main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});