"use strict";

const express = require('express');
const config = require('../config/config');
const router = express.Router();
const S3 = require('../aws_store');
const documentDB = require('../documentDB');


// Router
router.use(function (req, res, next) {
	console.log("Reddit Comment Stream Incoming: /" + req.method);
	next();
});

// Index Router (Health Check)
router.get('/', function (req, res) {
	console.log("Index");
});

// Get the rating of each subreddit 
router.get('/stats', function (req, res) {
	const key = (req.query.key).trim();
	let result = []; 
	documentDB.queryCollection(key, config.redditcollection.id)
	.then((data)=>{
		if(data.length > 0){
			result = result.concat(data);
			console.log(result);
		}
	}).catch( (err) => {
		console.log(err);
	});

	
});

// Receive POST from Reddit comment stream
router.post('/', function (req, res) {
	// Save in S3 Storage 
	//const bucketName = 'cab432-'+ req.body.id;
	// S3.createBucketPromise(bucketName)
	// S3.store_comment(bucketName,req.body);

	// Save in azure cosmoDB 
	documentDB.getDatabase().then(() => {
		documentDB.getCollection(config.redditcollection.id);
	}).then(() => {
		documentDB.getDocument(config.redditcollection.id, req.body);
		// 		console.log(str);
		// Sentiment Analysis on tweet
	}).catch(err => {
		console.log(err);
	});



});

module.exports = router;
