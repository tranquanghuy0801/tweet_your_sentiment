const creds = {
	twitter: {
		consumer_key: process.env.CONSUMER_KEY,
		consumer_secret: process.env.CONSUMER_SECRET,
		access_token: process.env.ACCESS_TOKEN,
		access_token_secret: process.env.ACCESS_TOKEN_SECRET
	},
	endpoint: process.env.ENDPOINT,
	primaryKey: {
		"id": process.env.PRIMARY_KEY,
	},
	database: {
		"id" : process.env.DATABASE
	},
	tweetCollection: { 
		"id": process.env.TWEET_COLLECTION,
	},
	trendCollection: {
		"id": process.env.TREND_COLLECTION,
	}
};

module.exports.creds = creds;