"use strict";
const AWS = require('aws-sdk');
const express = require('express');
const config = require('../config/config');
const router = express.Router();
const S3 = require('../aws_store');
const analysis = require('../scripts/commentAnalysis');

S3.createBucket(config.creds.tweetBucket);
S3.createBucket(config.creds.trendBucket);


// Router
router.use(function (req, res, next) {
	console.log("Twitter Stream Incoming: /" + req.method);
	next();
});

// Index Router (Health Check)
router.get('/', function (req, res) {
	console.log("Index");
});

// Receive POST from tweets and tags associated 
router.post('/tweet', function (req, res) {
	//Save in S3 Storage 
	const tweet = req.body.tweet; 
	const tags = req.body.tags;
	analysis.sentimentAnalysis(tweet,tags).then(result => {
		S3.storeBucket(config.creds.tweetBucket,result);
	}).catch(err => {
		console.log(err);
	})
	res.sendStatus(200);

});


// Receive POST from real-time trending topics in 
router.post('/trends',function(req,res,next){
	const key = 'cab432-trends-' + config.getFormattedDate(new Date());
	const params = { Bucket: config.creds.trendBucket, Key: key };
	const objectPromise = new AWS.S3({ apiVersion: '2006-03-01' }).deleteObject(params).promise();
	objectPromise.then(result => {
		console.log("Delete sucessfully");
	}).catch(err => {
		console.log(err);
	})
	const trends = req.body;
	let results = {}; 
	let tags = [];
	trends.forEach(trend => {
		if(trend.entityNames.length >= 1){
			trend.entityNames.forEach(keyword => {
				keyword = keyword.split(' ').join('-');
				console.log(keyword);
				tags.push(keyword);
			})
		}
	});
	results.id = key;
	results.tags = tags;
	S3.storeBucket(config.creds.trendBucket,results);
	res.sendStatus(200);
})

router.get('/stats',function(req,res,next){
	
})


module.exports = router;
