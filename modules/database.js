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
    const response = await s3.getObject(params).promise();
    return response.Body.toString('utf-8');
}

async function filedelete(fileName) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };
    return await s3.deleteObject(params).promise();
}
async function GetLastFileNAME() {
    const params = {
        Bucket: bucketName,
    };
    const response = await s3.listObjectsV2(params).promise();
    if (response.Contents && response.Contents.length > 0) {
        const filteredFiles = response.Contents.filter(file => !file.Key.includes('translated_'));
        if (filteredFiles.length === 0) {
            throw new Error('Bucket\'ta uygun dosya bulunamadı');
        }
        const sortedFiles = filteredFiles.sort((a, b) => a.LastModified - b.LastModified);
        return sortedFiles[0].Key;
    } else {
        throw new Error('Bucket\'ta hiç dosya bulunamadı');
    }
}

async function GiveAllFileNames() {
    const params = {
        Bucket: bucketName,
    };
    const response = await s3.listObjectsV2(params).promise();
    if (response.Contents && response.Contents.length > 0) {
        return response.Contents.map(file => file.Key);
    } else {
        throw new Error('Bucket\'ta hiç dosya bulunamadı');
    }
}

async function deleteAllFiles() {
    const params = {
        Bucket: bucketName,
    };
    const response = await s3.listObjectsV2(params).promise();
    if (response.Contents && response.Contents.length > 0) {
        const deleteParams = {
            Bucket: bucketName,
            Delete: {
                Objects: response.Contents.map(file => ({ Key: file.Key })),
            },
        };
        return await s3.deleteObjects(deleteParams).promise();
    } else {
        throw new Error('Bucket\'ta hiç dosya bulunamadı');
    }
    
}



module.exports = {
    fileupload,
    filedownload,
    filedelete,
    GetLastFileNAME,
    GiveAllFileNames,
    deleteAllFiles
}