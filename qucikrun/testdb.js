require('dotenv').config({ path: '../.env' });
const db = require('../modules/database.js');

async function main() {
    await db.filedelete("translated_test.txt");
}

main();
