const express = require('express');
const AWS = require('aws-sdk');
const config = require('../../server/config/config');
const request = require('request');
const router = express.Router();
const server = "http://localhost:3002/stream";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function getTags(){
  const params = { Bucket: config.creds.trendBucket, Key: 'cab432-trends-' + config.getFormattedDate(new Date()) };
  const tagPromise = new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params).promise();
  return new Promise((resolve,reject) => {
    tagPromise.then(result => {
      result = JSON.parse(result.Body.toString());
      resolve(result.tags);
    }).catch(err => {
      reject(err);
    })
  });
}

router.get('/search', function (req, res, next) {
  let tags = req.query.tags;
  getTags().then(result => {
    if (tags) {
      request({
        url: server,
        method: 'POST',
        form: { tags: tags }
      }, function (err, res, body) {
        if (!err) {
          console.log('Stream STOP Response: ' + res);
        } else {
          console.log('Unable to connect to stream server!');
        }
      });
    } else {
      console.log("Cannot extract tags");
    }
  });
  res.sendStatus(200);
});

module.exports = router;
