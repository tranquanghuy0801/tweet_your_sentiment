const express = require('express');
const router = express.Router();
const Twitter = require('twit');
const request = require('request');
const googleTrends = require('google-trends-api');
const config = require('../config/config');
const server = 'http://localhost:3001';

// Twit Configuration
const client = new Twitter({
	consumer_key: config.twitter.consumer_key,
	consumer_secret: config.twitter.consumer_secret,
	access_token: config.twitter.access_token,
	access_token_secret: config.twitter.access_token_secret
})

let stream = null;

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
						request({
							url: server + '/trends',
							method: 'POST',
							form: {keyword: keyword}
						}, function (err, res, body) {
							if (!err) {
								console.log('Trend Response: ' + res);
							} else {
								console.log('Unable to connect to server!');
							}
						});
					})
				}
			});
		}
	});
}

getTrends();
// Run every 15 seconds to update the trend topics 
setInterval(getTrends,90000);

async function parseTweets(body) {
	return new Promise((resolve) => {
		let tweet = body;
		let tweetMessage = '';
		if (tweet != undefined) {
			if (tweet.extended_tweet) {
				tweetMessage = tweet.extended_tweet.full_text;
			} else {
				if (tweet.retweeted_status) {
					if (tweet.retweeted_status.extended_tweet) {
						tweetMessage = tweet.retweeted_status.extended_tweet.full_text;
					} else {
						tweetMessage = tweet.retweeted_status.text;
					}
				} else {
					tweetMessage = tweet.text;
				}
			}
		}
		resolve(tweetMessage);
	});
};

// Router
router.use(function (req, res, next) {
	console.log("Trend Topics Incoming: /" + req.method);
	next();
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});


router.post('/stream', (req,res,next) => {
	let tags = req.body.tags.split('-');
	if (stream === null) {
		console.log('New Twitter Stream!');
		stream = client.stream('statuses/filter', { track: tags, language: 'en' });
		stream.on('tweet', function (tweet) {
			parseTweets(tweet).then(result => {
				request({
					url: server + '/tweet',
					method: 'POST',
					form: {
						id: tweet.id_str,
						tweet: result,
						tags: req.body.tags
					}
				}, function (err, res, body) {
					if (err) {
						console.log('Unable to connect to server!');
					}
				});
			});
		});
		stream.on('limit', function (message) {
			console.log("Limit Reached: " + message);
		});

		stream.on('disconnect', function (message) {
			console.log("Ooops! Disconnected: " + message);
		});
		stream.on('error', function (message) {
			console.log("Ooops! Error: " + message);
		});
	}
	else {
		stream.destroy();
		console.log("Stop the old stream and start the new stream!");
		stream = client.stream('statuses/filter', { track: tags, language: 'en' });

		stream.on('tweet', function (tweet) {
			parseTweets(tweet).then(result => {
				request({
					url: server + '/tweet',
					method: 'POST',
					form: {
						id: tweet.id_str,
						tweet: result,
						tags: req.body.tags,
					}
				}, function (err, res, body) {
					if (err) {
						console.log('Unable to connect to server!');
					}
				});
			})
		})

		stream.on('limit', function (message) {
			console.log("Limit Reached: " + message);
		});

		stream.on('disconnect', function (message) {
			console.log("Ooops! Disconnected: " + message);
		});
		stream.on('error', function (message) {
			console.log("Ooops! Error: " + message);
		});

		setTimeout(function () {
			stream.destroy();
			console.log('Stream Destroyed due to delay!');
		}, 900000);
	}
});


module.exports = router;
