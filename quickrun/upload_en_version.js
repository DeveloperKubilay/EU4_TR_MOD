require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');
const c = require('ansi-colors');

async function main() {
    const files = fs.readdirSync("../en");
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            await db.filedelete(file);//deltes files
            await db.filedelete("translated_"+file);//deltes files
        } catch { }
        await db.fileupload(file, fs.readFileSync(`../en/${file}`, 'utf8'));// uploads files
        console.log(c.green(`🚀 File ${c.bold(file)} uploaded successfully. ${c.cyan(files.length - i - 1)} files remaining.`));

    }
}

main();
