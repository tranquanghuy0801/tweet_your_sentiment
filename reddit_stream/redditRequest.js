"user strict";

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm-es6');
const request = require('request');

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
const comments = s.Stream("comment", {
	subreddit: "all",
	results: 100, // defaults to 25, max is 100
	pollTime: 5000
});

comments.on("item", comment => {
	console.log('Comment of post: ' + comment.link_title);
	console.log('Comment is: ' + comment.body);
	request({
		url: 'http://localhost:3000/reddit', // Put the load balancer url here after 
		method: 'POST',
		json: comment
	}, function (err, res, body) {
		if (!err && res.statusCode === 200) {
			console.log(body);
		}
	}
);
});

comments.on("error", e => {
	console.log(e); // stop breaking the rate-limit
});

comments.on("end", () => {
	console.log("your one hour comment stream has ended.");
});

setTimeout(() => {
	comments.emit("end");
}, 3600000);
