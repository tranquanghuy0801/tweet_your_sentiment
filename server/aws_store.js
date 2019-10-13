const AWS = require('aws-sdk');
const sentiment = require('./scripts/commentAnalysis');
const bucketName = 'cab432-reddit-comments';

function store_comment(comment){
    const s3Key = `reddit-${comment.subreddit}`;
	const params = { Bucket: bucketName, Key: s3Key };
    return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
        if(result){
            console.log("Found the data");
        }
        else{
            //const title = comment.link_title.replace(/[^a-zA-Z ]/g, "")
            //const content = comment.body.replace(/[^a-zA-Z ]/g, "")
            sentiment.sentimentAnalysis(comment).then((response) => {
                const body = JSON.stringify({ source: 'S3 Bucket', ...response }); 
                const objectParams = { Bucket: bucketName, Key: s3Key, Body: body }; 
               const uploadPromise = new AWS.S3({
                    apiVersion: '2006-03-01'
                }).putObject(objectParams).promise();
                
                uploadPromise.then(function (data) {
                    console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
                }).catch(err => {
                    console.log(err);
                });
            })
        }
    });
};

module.exports.store_comment = store_comment;
