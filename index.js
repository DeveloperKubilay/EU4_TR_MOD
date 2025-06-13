require('dotenv').config();

const db = require('./modules/database.js');

async function main() {
    const lastfile = await db.GetLastFileNAME();
    
    const text = await db.filedownload(lastfile);
    await db.filedelete(lastfile);


}
main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});