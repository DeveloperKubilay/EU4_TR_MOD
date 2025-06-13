const AWS = require('aws-sdk');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3({
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    region: 'auto',
    signatureVersion: 'v4',
});


async function fileupload(fileName, fileContent) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: 'text/plain',
    };
    return await s3.upload(params).promise();
}

async function filedownload(fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };
    return await s3.getObject(params).promise();
}

async function filedelete(fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };
    return await s3.deleteObject(params).promise();
}



module.exports = {
    fileupload,
    filedownload,
    filedelete
}