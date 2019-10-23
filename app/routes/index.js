"use strict";
const express = require('express');
const config = require('../config/config');
const redis = require('redis');
const request = require('request');
const router = express.Router();
const googleTrends = require('google-trends-api');
const documentDB = require('../documentDB');
const helper = require('../scripts/helper');
const Twitter = require('twit');
const server = 'http://localhost:3000';

// Create Redis Database 
let redisClient = redis.createClient();
redisClient.on('connect', function(){
	console.log('Connected to Redis...');
});
redisClient.on('error', (err) => { console.log("Error " + err);
});

// Create Database and two collections to save tweets and trends 
// in CosmoDB azure 
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

// Function to get trends from Google Trends 
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
						let redisKey = 'cab432trends:' + keyword.split(' ').join('-');
						keyword = 'cab432-trends-' + keyword.split(' ').join('-');
						result.id = keyword;
						redisClient.get(redisKey, (err, data) => {
							if (data) {
								console.log("Data in Redis");
							}
							else {
								if (documentDB.doesDocumentExist(config.creds.trendCollection.id, result) === null) {
									console.log("Save trends to both Redis and Azure");
									redisClient.setex(redisKey, 3600, JSON.stringify(result));
									documentDB.getDocument(config.creds.trendCollection.id, result);
								} else {
									console.log("The keyword exists in DocumentDB database, save to Redis");
									redisClient.setex(redisKey, 3600, JSON.stringify(result));
								}
							}
						})
					})
				}
			});
		}
	});
}

// getTrends();
// // Run every 15 seconds to update the trend topics 
// setInterval(getTrends, 200000);

// Extract values from Redis or azure for a specific keyword 
function getColumn(column, tags) {
	let redisKey = 'cab432tweets:' + tags;
	return new Promise((resolve) => {
		redisClient.hgetall(redisKey,function(err,result){
			if(result){
				console.log('Get data from Redis');
				let values = Object.values(result).map(function (i) {
					let data = JSON.parse(i);
					if (data.tags === tags) {
						return data;
					}
					else {
						return '';
					}
				});
				//values = values.filter(Number);
				resolve(values);
			}
			else{
				console.log('Get data from azure');
				documentDB.queryCollection(config.creds.tweetCollection.id, column, tags)
					.then(results => {
						if (results) {
							resolve(results);
						}
					}).catch(err => {
						console.log(err);
					})
			}
		})
	});
}

// Function get all of the trend keywords
function getTags() {
	return new Promise((resolve) => {
		redisClient.keys('cab432trends:*',function(err,trends){
			if(trends){
				trends = trends.map(text => {
					return text.replace('cab432trends:', '');
				})
				console.log("Get trends from Redis");
				resolve(trends);
			} else {
				documentDB.queryCollection(config.creds.trendCollection.id, 'id', '')
					.then(results => {
						if (results) {
							results = results.map(text => {
								return text.replace('cab432-trends-', '');
							})
							console.log("Get trends from azure");
							resolve(results);
						}
					}).catch(err => {
						console.log(err);
					})
			}
		})
	});
}

// Router
router.use(function (req, res, next) {
	console.log("Twitter Stream Incoming: /" + req.method);
	next();
});

// Router POST 
// Receive tags from user to start streaming 
router.post('/stream', (req, res, next) => {
	let tags = req.body.tags.split('-');
	let redisKey = 'cab432tweets:' + req.body.tags;
	if (stream === null) {
		console.log('New Twitter Stream!');
		stream = client.stream('statuses/filter', { track: tags, language: 'en' });
		// Start Streaming 
		stream.on('tweet', function (tweet) {
			helper.parseTweets(tweet).then(result => {
				helper.sentimentAnalysis(result, tags, tweet.id_str).then(result => {
					redisClient.hgetall(redisKey, (err, data) => {
						if(data){
								if(data[result.id] === undefined){
									console.log("Save to both Redis and Azure");
									redisClient.hset(redisKey, result.id, JSON.stringify(result));
									documentDB.getDocument(config.creds.tweetCollection.id, result);
								} else{ 
									console.log("The tweet exists in Redis");
								}
						}
						else {
								console.log("Save to Redis at first");
								redisClient.hset(redisKey, result.id, JSON.stringify(result));
								documentDB.getDocument(config.creds.tweetCollection.id, result);
						} 
					});
				}).catch(err => {
					console.log(err);
				})
			})
		});
	}
	else {
		stream.stop();
		console.log("Stop the old stream and start the new stream!");
		// Remove old stream to create new stream 
		stream = client.stream('statuses/filter', { track: tags, language: 'en' });
		stream.on('tweet', function (tweet) {
			helper.parseTweets(tweet).then(result => {
				helper.sentimentAnalysis(result, tags, tweet.id_str).then(result => {
					redisClient.hgetall(redisKey, (err, data) => {
						if(data){
								if(data[result.id] === undefined){
									console.log("Save to both Redis and Azure");
									redisClient.hset(redisKey, result.id, JSON.stringify(result));
									documentDB.getDocument(config.creds.tweetCollection.id, result);
								}else{
									console.log("The tweet exists in Redis");
								}
						}
						else {
								console.log("Save to Redis at first");
								redisClient.hset(redisKey, result.id, JSON.stringify(result));
								documentDB.getDocument(config.creds.tweetCollection.id, result);
						} 
					});
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

// Function to render index page 
async function renderIndex(res,result,tags){
	await getColumn('all', tags).then(async data => {
		let good_sentiment = [];
		let bad_sentiment = [];
		console.log(data);
		if (data.length === 0) {
			let delayres = await helper.delay(3000);
			await getColumn('all', tags).then(async data => {
				if(data.length !== 0){
					data.forEach(element => {
						// Extract good and neural score texts 
						if(element.score >= 0){
							good_sentiment.push(element.text);
						}
						// Extract bad score texts 
						else{
							bad_sentiment.push(element.text);
						}
					})
					// Save in the texts in CSV folder for visualization
					helper.saveCSV(helper.parseDataArray(good_sentiment),"public/javascripts/wordCount.csv");
					helper.saveCSV(helper.parseDataArray(bad_sentiment),"public/javascripts/test.csv");
				}
				res.render('index', { tags: tags, trends: result});
			}).catch(err => {
				console.log(err);
			})
		}
		else {
			data.forEach(element => {
				// Extract good and neural score texts 
				if(element.score >= 0){
					good_sentiment.push(element.text);
				}
				// Extract bad score texts 
				else{
					bad_sentiment.push(element.text);
				}
			})
			// Save in the texts in CSV folder for visualization
			helper.saveCSV(helper.parseDataArray(good_sentiment),"public/javascripts/wordCount.csv");
			helper.saveCSV(helper.parseDataArray(bad_sentiment),"public/javascripts/test.csv");
			res.render('index',  { tags: tags, trends: result });
		}
	}).catch(err => {
		console.log(err);
	})
}

/* GET home page. */
router.get('/', function (req, res, next) {
	let tags = req.query.tags;
	getTags().then(async result => {
		result = result.map(text => {
			return text.replace(/[^\w\s]/gi, ' ');
		})
		if (tags) {
			// Create a POST request to start streaming 
			request({
				url: server + '/stream',
				method: 'POST',
				form: { tags: tags }
			}, function (err, response, body) {
				if (!err) {
					console.log('Stream STOP Response: ' + response);
				} else {
					console.log('Unable to connect to stream server!');
				}
			})
			renderIndex(res,result,tags);
		}
		else {
			res.render('index',  { tags: undefined, trends: result});
		}
	});
});

module.exports = router;


