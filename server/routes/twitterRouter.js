"use strict";
const express = require('express');
const config = require('../config/config');
const redis = require('redis');
const router = express.Router();
const googleTrends = require('google-trends-api');
const documentDB = require('../documentDB');
const analysis = require('../scripts/helper');
const Twitter = require('twit');

documentDB.getDatabase().then(() => {
	documentDB.getCollection(config.creds.tweetCollection.id);
}).then(() => {
	documentDB.getCollection(config.creds.trendCollection.id);
}).catch(err => {
	console.log(err);
})

// Twit Configuration
const client = new Twitter({
	consumer_key: config.creds.twitter.consumer_key,
	consumer_secret: config.creds.twitter.consumer_secret,
	access_token: config.creds.twitter.access_token,
	access_token_secret: config.creds.twitter.access_token_secret
})

let stream = null;

let output = {}; 
output.data = [];

function getTrends() {
	googleTrends.realTimeTrends({
		geo: 'AU',
		category: 'all',
	}, function (err, results) {
		if (err) {
			console.log(err);
		} else {
			const trends = JSON.parse(results);
			trends.storySummaries.trendingStories.forEach(trend => {
				if (trend.entityNames.length >= 1) {
					trend.entityNames.forEach(keyword => {
						let result = {};
						keyword = 'cab432-trends-' + keyword.split(' ').join('-');
						result.id = keyword;
						if (!documentDB.doesDocumentExist(config.creds.trendCollection.id, keyword)) {
							console.log("The keyword exists in database");
						} else {
							documentDB.getDocument(config.creds.trendCollection.id, result);
						}
					})
				}
			});
		}
	});
}

getTrends();
// Run every 15 seconds to update the trend topics 
setInterval(getTrends,90000);


// Router
router.use(function (req, res, next) {
	console.log("Twitter Stream Incoming: /" + req.method);
	next();
});

// Index Router (Health Check)
router.get('/', function (req, res) {
	console.log("Index");
});

let tags;

router.post('/stream', (req,res,next) => {
	tags = req.body.tags.split('-');
	if (stream === null) {
		console.log('New Twitter Stream!');
		stream = client.stream('statuses/filter', { track: tags, language: 'en' });
		stream.on('tweet', function (tweet) {
			analysis.parseTweets(tweet).then(result => {
				analysis.sentimentAnalysis(result,tags,tweet.id_str).then(result => {
					//S3.storeBucket(config.creds.tweetBucket, result);
					documentDB.getDocument(config.creds.tweetCollection.id,result);
				}).catch(err => {
					console.log(err);
				})
			})
		});
	}
	else {
		stream.destroy();
		console.log("Stop the old stream and start the new stream!");
		stream = client.stream('statuses/filter', { track: tags, language: 'en' });

		stream.on('tweet', function (tweet) {
			analysis.parseTweets(tweet).then(result => {
				analysis.sentimentAnalysis(result,tags,tweet.id_str).then(result => {
					//S3.storeBucket(config.creds.tweetBucket, result);
					documentDB.getDocument(config.creds.tweetCollection.id,result);
				}).catch(err => {
					console.log(err);
				})
			})
		})

		setTimeout(function () {
			stream.destroy();
			console.log('Stream Destroyed due to delay!');
		}, 900000);
	}
	stream.on('limit', function (message) {
		console.log("Limit Reached: " + message);
	});

	stream.on('disconnect', function (message) {
		console.log("Ooops! Disconnected: " + message);
	});
	stream.on('error', function (message) {
		console.log("Ooops! Error: " + message);
	});
});

router.get('/stats', async function (req, res, next) {
	let tags = req.query.tags;
	let result = {};
	await getScores('score', tags).then(data => {
		result.score = data;
		res.json(result);
	}).catch(err => {
		console.log(err);

	})

})


function getScores(column,tags){
	return new Promise((resolve) => {
	  documentDB.queryCollection(config.creds.tweetCollection.id,column,tags)
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
