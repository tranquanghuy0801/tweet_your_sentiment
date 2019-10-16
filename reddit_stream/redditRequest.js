"use strict";

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm-es6');
const request = require('request');
const sentiment = require('./scripts/commentAnalysis');

// Application configuration 
const config = require(__dirname + '/config.js');

// Create Reddit Client 
const client = new Snoowrap({
	userAgent: 'cab432_cloud_ass',
	clientId: config.reddit.CLIENT_ID,
	clientSecret: config.reddit.CLIENT_SECRET,
	username: config.reddit.REDDIT_USER,
	password: config.reddit.REDDIT_PASS
});

const s = new Snoostorm(client);
let comments = null;

/*
Main start of Reddit comment stream 
*/
function startStream() {
	setTimeout(function () {
		startStreamMain(), 10000
	});
}

function startStreamMain() {
	// Handle restarting
	if (comments != null) {
		// Stream needs to stop, and we need to hold off before starting again...
		comments = null;
		// Not infinite loop I promise <3
		setTimeout(function () {
			startStreamMain, 5000
		});  // Wait 5 seconds to create new stream

	} else {
		console.log("New Reddit Streaming Comment");
		comments = s.Stream("comment", {
			subreddit: "all",
			results: 50 // defaults to 25, max is 100

		});
		comments.on("item", (comment) => {
			//console.log('Comment of post: ' + comment.link_title);
			//console.log('Comment is: ' + comment.body);
			sentiment.sentimentAnalysis(comment).then((data) => {
				console.log(data);
				request({
					url: 'http://localhost:3000/reddit', // Put the load balancer url here after 
					method: 'POST',
					json: data
				}, function (err, res, body) {
					if (err) {
						console.log('Unable to connect the server');
					}
				});
			});
		});

		comments.on("error", e => {
			console.log(e); // stop breaking the rate-limit
		});

		comments.on("end", () => {
			console.log("your comment stream has ended.");
		});
		setTimeout(function () {
			comments.emit("end");
			console.log('streaming comments are destroyed due to delay');
		}, 900000);
	}


}

startStream();