const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const createCSVWriter = require('csv-writer').createObjectCsvWriter;
const commonWords = "doesnt,dont,poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall"

// Function used to delay command before executing next command 
async function delay(delayInms) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(2);
		}, delayInms);
	});
}

// Calculate the sentiment score of each tweet input 
function sentimentAnalysis(text, tags, id) {
	let output = {};
	return new Promise((resolve) => {
		if (text !== undefined) {
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
			resolve(output);
		}
	});
};

// Extract the tweet text from the tweet object from the streaming 
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

/// This function sorts iterates over an array of tweets and stores the word and the word counts in an objeect
function parseDataArray(rawData) {
	let word_count = {};
	// Parse the Data
	for (let i = 0; i < rawData.length; i++) {
	  let textString = rawData[i];
	  //console.log(textString)
	  let words = textString.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
	  //console.log(words)
	  words.forEach(function (word) {
		word = word.toLowerCase();
		if (word != "" && commonWords.indexOf(word) == -1 && word.length > 1) {
		  if (word_count[word]) {
			word_count[word]++;
		  } else {
			word_count[word] = 1;
		  }
		}
	  })
	}    
	//console.log(word_count);  
	return word_count;
};

// This function will turn the object of wordcounts and save it into a CSVfile for D3JS to visualise 
function saveCSV(word_count, path) {
	const csvWriter = createCSVWriter( {
	  path: path,
	  header: [
		{id: 'word', title:'Word'},
		{id: 'frequency', title: 'Frequency'}
	  ]
	});
	let data = [];
	for (let key in word_count) {
		//let str = "{ word: " + "'"+ key + "'" + "," + " frequency:" + "'" + word_count[key] +"'" + "}";
		let obj = {};
		obj.word = key;
		obj.frequency = word_count[key];
		//eval('var obj='+str);
		data.push(obj);
		
	}
	csvWriter
	  .writeRecords(data)
	  .then( ()=> console.log('The CSV file was written Successfully'));
}
  
module.exports.delay = delay;
module.exports.parseDataArray = parseDataArray;
module.exports.saveCSV = saveCSV;
module.exports.parseTweets = parseTweets;
module.exports.sentimentAnalysis = sentimentAnalysis;