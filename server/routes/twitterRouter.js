"use strict";
const express = require('express');
const config = require('../config/config');
const redis = require('redis');
const router = express.Router();
const documentDB = require('../documentDB');
const analysis = require('../scripts/commentAnalysis');

// S3.createBucket(config.creds.tweetBucket);
// S3.createBucket(config.creds.trendBucket);
documentDB.getDatabase().then(() => {
	documentDB.getCollection(config.creds.tweetCollection.id);
}).then(() => {
	documentDB.getCollection(config.creds.trendCollection.id);
}).catch(err => {
	console.log(err);
})


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
	const id = req.body.id;
	analysis.sentimentAnalysis(tweet, tags, id).then(result => {
		//S3.storeBucket(config.creds.tweetBucket, result);
		documentDB.getDocument(config.creds.tweetCollection.id,result);
	}).catch(err => {
		console.log(err);
	})
	res.sendStatus(200);

});


// Receive POST from real-time trending topics in 
router.post('/trends', function (req, res, next) {
	let result = {};
	let keyword = req.body.keyword;
	keyword = 'cab432-trends-' + keyword.split(' ').join('-');
	result.id = keyword;
	if(!documentDB.doesDocumentExist(config.creds.trendCollection.id,keyword)){
		console.log("The keyword exists in database");
	} else {
		documentDB.getDocument(config.creds.trendCollection.id,result);
	}
	// const params = { Bucket: config.creds.trendBucket, Key: keyword };
	// new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, data) => {
	// 	if (data) {
	// 		console.log("The keyword already exists");
	// 	}
	// 	else {
	// 		result.id = keyword;
	// 		S3.storeBucket(config.creds.trendBucket, result);
	// 	}
	// })
	res.sendStatus(200);
})

router.get('/stats', function (req, res, next) {


})

function getScores(){
	return new Promise((resolve) => {
	  documentDB.queryCollection(config.creds.tweetCollection.id,"score")
	  .then(results => {
		if(results){
		  resolve(results);
		}
	  }).catch(err => {
		console.log(err);
	  })
	});
}



module.exports = router;
