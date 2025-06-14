require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');

async function main() {
    const files = fs.readdirSync("../en");
    for (let i = 0; i < files.length; i++) {
        const file = files[i].replace("english","turkish");

        fs.writeFileSync(`../tr/${file}`, 
            await db.filedownload("translated_"+file)
        );

    }
}

main();
