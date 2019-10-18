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

function getTrends() {
  googleTrends.realTimeTrends({
    geo: 'AU',
    category: 'all',
  }, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      const trends = JSON.parse(results);
      request({
        url: server + '/trends',
        method: 'POST',
        json: trends.storySummaries.trendingStories
      }, function (err, res, body) {
        if (!err) {
          console.log('Trend Response: ' + res);
        } else {
          console.log('Unable to connect to server!');
        }
      });
    }
  });
}

// getTrends();
// setTimeout(function(){
//   getTrends();
// },90000);

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

let stream = null;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/stream', function (req, res, next) {
  const tags = req.body.tags.split('-');
  if (stream === null) {
    console.log('New Twitter Stream!');
    stream = client.stream('statuses/filter', { track: tags, language: 'en' });
    stream.on('tweet', function (tweet) {
      parseTweets(tweet).then(result => {
        request({
          url: server + '/tweet',
          method: 'POST',
          form: {
            tweet: result,
            tags: req.body.tags,
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
    stream.stop();
    console.log("Stop the old stream and start the new stream!");
    stream = client.stream('statuses/filter', { track: tags, language: 'en' });

    stream.on('tweet', function (tweet) {
      parseTweets(tweet).then(result => {
        request({
          url: server + '/tweet',
          method: 'POST',
          form: { tweet: result,
                  tags: req.body.tags, }
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
