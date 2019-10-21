"use strict";
const express = require('express');
const config = require('../config/config');
const redis = require('redis');
const request = require('request');
const router = express.Router();
const googleTrends = require('google-trends-api');
const documentDB = require('../documentDB');
const analysis = require('../scripts/helper');
const Twitter = require('twit');
const server = 'http://localhost:3000';

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

function getScores(column, tags) {
  return new Promise((resolve) => {
    documentDB.queryCollection(config.creds.tweetCollection.id, column, tags)
      .then(results => {
        if (results) {
          resolve(results);
        }
      }).catch(err => {
        console.log(err);
      })
  });
}

async function delay(delayInms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}

function getTags() {
  return new Promise((resolve) => {
    documentDB.queryCollection(config.creds.trendCollection.id, 'id', '')
      .then(results => {
        if (results) {
          results = results.map(text => {
            return text.replace('cab432-trends-', '');
          })
          resolve(results);
        }
      }).catch(err => {
        console.log(err);
      })
  });
}

getTrends();
// Run every 15 seconds to update the trend topics 
setInterval(getTrends, 90000);

// Router
router.use(function (req, res, next) {
  console.log("Twitter Stream Incoming: /" + req.method);
  next();
});

router.post('/stream', (req, res, next) => {
  let tags = req.body.tags.split('-');
  if (stream === null) {
    console.log('New Twitter Stream!');
    stream = client.stream('statuses/filter', { track: tags, language: 'en' });
    stream.on('tweet', function (tweet) {
      analysis.parseTweets(tweet).then(result => {
        analysis.sentimentAnalysis(result, tags, tweet.id_str).then(result => {
          //S3.storeBucket(config.creds.tweetBucket, result);
          documentDB.getDocument(config.creds.tweetCollection.id, result);
        }).catch(err => {
          console.log(err);
        })
      })
    });
  }
  else {
    stream.stop();
    console.log("Stop the old stream and start the new stream!");
    stream = client.stream('statuses/filter', { track: tags, language: 'en' });

    stream.on('tweet', function (tweet) {
      analysis.parseTweets(tweet).then(result => {
        analysis.sentimentAnalysis(result, tags, tweet.id_str).then(result => {
          //S3.storeBucket(config.creds.tweetBucket, result);
          documentDB.getDocument(config.creds.tweetCollection.id, result);
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

router.get('/search', async function (req, res, next) {
  let tags = req.query.tags;
  //let result = {};
  let score;
  await getScores('score', tags).then(async data => {
    //result.score = data;
    // res.json(result);
    if (data.length === 0) {
      let delayres = await delay(3000);
      await getScores('score', tags).then(async data => {
        if(data.length == 0){
          score = 0;
        }
        else{
          score = data.reduce(function (a, b) { return a + b; });
        }
        res.render('score', { title: 'Express', score: score });
      }).catch(err => {
        console.log(err);
      })
    }
    else {
      score = data.reduce(function (a, b) { return a + b; });
      res.render('score', { title: 'Express', score: score });
    }
  }).catch(err => {
    console.log(err);

  })

})

// router.get('/search', function (req, res, next) {
//   let tags = req.query.tags;
//   let score;
//   const options = {
//     url: server + '/stats',
//     qs: {
//       tags: tags
//     }
//   }
//   request.get(options, function (err, response, body) {
//     if (!err) {
//       let json = JSON.parse(body);
//       if (json.score.length == 0) {
//         score = 0;
//       }
//       else {
//         score = json.score.reduce(function (a, b) { return a + b; });
//       }
//       res.render('score', { title: 'Express', score: score });
//     }
//     else {
//       res.render('score', { title: 'Express', score: 0 });
//     }
//   })
// })



/* GET home page. */
router.get('/', function (req, res, next) {
  let tags = req.query.tags;
  getTags().then(async result => {
    result = result.map(text => {
      return text.replace(/[^\w\s]/gi, ' ');
    })
    // let json;
    if (tags) {
      request({
        url: server + '/stream',
        method: 'POST',
        form: { tags: tags }
      }, function (err, response, body) {
        if (!err) {
          // json = JSON.parse(body);
          // console.log(json);
          console.log('Stream STOP Response: ' + response);
        } else {
          console.log('Unable to connect to stream server!');
        }
      })
      res.redirect('/search?tags=' + tags);
    }
    else {
      res.render('index', { title: 'Express', tags: result, score: 0 });
    }
  });
});

module.exports = router;


