const AWS = require('aws-sdk');
// Create unique bucket name
const bucketName = 'harrytran-wikipedia-store'; //Basic key/key - fixed here, modify for the route code
const key = 'Woof';
const s3Key = `wikipedia-${key}`;
// Create a promise on S3 service object
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();
// Handle promise fulfilled/rejected states
bucketPromise.then(function (data) {
    // Create params for putObject call
    const objectParams = { Bucket: bucketName, Key: s3Key, Body: 'Sam Wonder Dog' }; // Create object upload promise
    const uploadPromise = new AWS.S3({
        apiVersion: '2006-03-01'}).putObject(objectParams).promise(); uploadPromise.then(function(data) {
        console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
    });
}).catch(function (err) {
    console.error(err, err.stack);
});