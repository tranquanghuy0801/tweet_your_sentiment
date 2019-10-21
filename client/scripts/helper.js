const Sentiment = require('sentiment');
const sentiment = new Sentiment();


function sentimentAnalysis(text,tags,id) {
    let output = {};
    return new Promise((resolve) => {
        if(text !== undefined){
            text = text.replace(/[^a-zA-Z ]/g, "");
			const result = sentiment.analyze(text);
            output = {
                "id": 'cab432-tweets-' + id,
                "tags": tags.join('-'),
                "text": text,
                "score": result.score,
                "pos_words": result.pos_words,
                "neg_word": result.neg_word
			};
			console.log(output);
            resolve(output);
        }
    });
};

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


module.exports.parseTweets = parseTweets;
module.exports.sentimentAnalysis = sentimentAnalysis;