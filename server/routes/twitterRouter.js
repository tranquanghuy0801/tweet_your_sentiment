"use strict";

const express = require('express');
const config = require('../config/config');
const router = express.Router();
const S3 = require('../aws_store');
const analysis = require('../scripts/commentAnalysis');

S3.createBucketPromise(config.creds.tweetBucket);
S3.createBucketPromise(config.creds.trendBucket);


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
		S3.store_comment(config.creds.tweetBucket,result);
	}).catch(err => {
		console.log(err);
	})
	res.sendStatus(200);

});


// Receive POST from real-time trending topics in 
router.post('/trends',function(req,res,next){
	const trends = req.body;
	let results = {}; 
	let tags = [];
	trends.forEach(trend => {
		if(trend.entityNames.length >= 1){
			trend.entityNames.forEach(keyword => {
				keyword = keyword.split().join('-');
				console.log(keyword);
				tags.push(keyword);
			})
		}
	});
	results.id = 'cab432-trends-' + config.getFormattedDate(new Date());
	results.tags = tags;
	S3.store_comment(config.creds.trendBucket,results);
	res.sendStatus(200);
})

router.get('/stats',function(req,res,next){
	
})


module.exports = router;
