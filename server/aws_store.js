const AWS = require('aws-sdk');

function createBucketPromise(bucketName){
    const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise(); 
    bucketPromise.then(function (data) {
        console.log("Successfully created " + bucketName);
    })
    .catch(function (err) {
        console.error(err, err.stack);
    });
}


function store_comment(bucketName,comment){
    const s3Key = `reddit-${comment.id}`;
	const params = { Bucket: bucketName, Key: s3Key };
    return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
        if(result){
            console.log("Found the data");
        }
        else{
            //const title = comment.link_title.replace(/[^a-zA-Z ]/g, "")
            //const content = comment.body.replace(/[^a-zA-Z ]/g, "")
            const body = JSON.stringify({ source: 'S3 Bucket', ...comment });
            const objectParams = { Bucket: bucketName, Key: s3Key, Body: body };
            const uploadPromise = new AWS.S3({
                apiVersion: '2006-03-01'
            }).putObject(objectParams).promise();

            uploadPromise.then(function (data) {
                console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
            }).catch(err => {
                console.log(err);
            });
        }
    });
};

module.exports.createBucketPromise = createBucketPromise;
module.exports.store_comment = store_comment;
