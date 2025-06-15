require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');
const c = require('ansi-colors');

async function main() {
    const files = fs.readdirSync("../en");
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            await db.filedelete("translated_"+file);//deltes files
            console.log(c.green(`🚀 File ${c.bold(file)} deleted successfully.`));
        } catch { }
    }
}

main();
