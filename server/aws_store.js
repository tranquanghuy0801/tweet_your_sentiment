const AWS = require('aws-sdk');
const S3 = new AWS.S3();

function createBucket(bucketName){
		const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise(); 
		bucketPromise.then(function (data) {
				console.log("Successfully created " + bucketName);
		})
		.catch(function (err) {
				console.error(err, err.stack);
		});
}

function deleteObject(bucketName,object){
	const s3Key = `${object.id}`;
	const params = { Bucket: bucketName, Key: s3Key };
	return new AWS.S3({ apiVersion: '2006-03-01' }).deleteObject(params, function(err, data) {
		if (err) console.log(err, err.stack);  // error
		else     console.log("Delete the object");                 // deleted
	});
}


function storeBucket(bucketName,object){
	const s3Key = `${object.id}`;
	const params = { Bucket: bucketName, Key: s3Key };
		return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
				if(result){
						console.log("Found the data");
				}
				else{
						//const title = comment.link_title.replace(/[^a-zA-Z ]/g, "")
						//const content = comment.body.replace(/[^a-zA-Z ]/g, "")
						const body = JSON.stringify({ source: 'S3 Bucket', ...object });
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

const getDataUsingS3Select = async (params) => {
		// 1
		return new Promise((resolve, reject) => {
			S3.selectObjectContent(params, (err, data) => {
				if (err) { reject(err); }
	
				if (!data) {
					reject('Empty data object');
				}
	
				// This will be an array of bytes of data, to be converted
				// to a buffer
				const records = []
	
				// This is a stream of events
				data.Payload.on('data', (event) => {
					// There are multiple events in the eventStream, but all we 
					// care about are Records events. If the event is a Records 
					// event, there is data inside it
					if (event.Records) {
						records.push(event.Records.Payload);
					}
				})
				.on('error', (err) => {
					reject(err);
				})
				.on('end', () => {
					// Convert the array of bytes into a buffer, and then
					// convert that to a string
					let planetString = Buffer.concat(records).toString('utf8');
	
					// 2
					// remove any trailing commas
					planetString = planetString.replace(/\,$/, '');
	
					// 3
					// Add into JSON 'array'
					planetString = `[${planetString}]`;
	
					try {
						const planetData = JSON.parse(planetString);
						resolve(planetData);
					} catch (e) {
						reject(new Error(`Unable to convert S3 data to JSON object. S3 Select Query: ${params.Expression}`));
					}
				});
			});
		})
}

module.exports.getDataUsingS3Select = getDataUsingS3Select;
module.exports.createBucket = createBucket;
module.exports.deleteObject = deleteObject;
module.exports.storeBucket = storeBucket;
