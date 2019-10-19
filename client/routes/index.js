const express = require('express');
const config = require('../config');
const documentDB = require('../../server/documentDB');
const request = require('request');
const router = express.Router();
const server = "http://localhost:3002/stream";

/* GET home page. */


// async function getTags(){
// 	return new Promise(async (resolve) => {
//     const s3 = new AWS.S3();
//     let tags = [];
// 		const params = {
// 			Bucket: config.creds.trendBucket,
// 			Delimiter: '/',
// 			Prefix:  'cab432-trends-'
// 		};

// 		const data = await s3.listObjects(params).promise();
// 		for (let index = 1; index < data['Contents'].length; index++) {
// 			let text = data['Contents'][index]['Key'].replace('cab432-trends-','');
// 			if(!tags.includes(text)){
// 				tags.push(text);
// 			}
//     }
//     resolve(tags);
// 	})
// }

function getTags(){
  return new Promise((resolve) => {
    documentDB.queryCollection(config.creds.trendCollection.id,"id")
    .then(results => {
      if(results){
        results = results.map(text => {
          return text.replace('cab432-trends-','');
        })
        resolve(results);
      }
    }).catch(err => {
      console.log(err);
    })
  });
}


router.get('/',async function (req, res, next) {
  let tags = req.query.tags;
  await getTags().then(result => {
    result = result.map(text => {
      return text.replace(/[^\w\s]/gi, ' ');
    })
    if(tags){
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
    }
    else{
      res.render('index', { title: 'Express' , tags: result});
    }
  });
});

module.exports = router;
