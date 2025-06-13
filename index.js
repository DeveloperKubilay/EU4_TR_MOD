require('dotenv').config();

const db = require('./modules/database.js');

async function main(){
    try {
        const uploadResponse = await db.fileupload('test.txt', 'Hello, Cloudflare R2!');
        console.log('File uploaded successfully:', uploadResponse.Location);


       /* const downloadResponse = await filedownload('test.txt');
        console.log('File downloaded successfully:', downloadResponse.Body.toString());*/
    } catch (error) {
        console.error('Error:', error);
    }
}
main()