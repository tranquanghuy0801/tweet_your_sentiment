const express = require('express');
const AWS = require('aws-sdk');
const config = require('../config');
const request = require('request');
const router = express.Router();
const server = "http://localhost:3002/stream";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


async function getTags(){
	return new Promise(async (resolve) => {
    const s3 = new AWS.S3();
    let tags = [];
		const params = {
			Bucket: config.creds.trendBucket,
			Delimiter: '/',
			Prefix:  'cab432-trends-'
		};

		const data = await s3.listObjects(params).promise();
		for (let index = 1; index < data['Contents'].length; index++) {
			let text = data['Contents'][index]['Key'].replace('cab432-trends-','');
			if(!tags.includes(text)){
				tags.push(text);
			}
    }
    resolve(tags);
	})
}

router.get('/search',async function (req, res, next) {
  await getTags().then(result => {
    let tags = result.join('-').split('-');
    console.log(tags);
    request({
      url: server,
      method: 'POST',
      form: { tags: tags}
    }, function (err, res, body) {
      if (!err) {
        console.log('Stream STOP Response: ' + res);
      } else {
        console.log('Unable to connect to stream server!');
      }
    });
  });
  res.sendStatus(200);
});

module.exports = router;
