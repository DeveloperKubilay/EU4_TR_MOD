require('dotenv').config({ path: '../.env' });

const db = require('../modules/database.js');
const fs = require('fs');

async function main() {
    const files = fs.readdirSync("../en");
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
            await db.filedelete(file);//deltes files
        } catch { }
        await db.fileupload(file, fs.readFileSync(`../en/${file}`, 'utf8'));// uploads files
        console.log(`File ${file} uploaded successfully. ${files.length - i - 1} files remaining.`);

    }
}

main();
