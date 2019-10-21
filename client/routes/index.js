const express = require('express');
const config = require('../config');
const documentDB = require('../../server/documentDB');
const request = require('request');
const router = express.Router();
const server = "http://localhost:3001";


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

router.get('/search',function(req,res,next){
  let tags = req.query.tags;
  let score;
  const options = {
    url: server + '/stats',
    qs: {
      tags: tags
    }
  }
  request.get(options,function(err,response,body){
    if(!err){
      let json = JSON.parse(body);
      if(json.score.length == 0){
        score = 0;
      }
      else{
        score = json.score.reduce(function(a, b){return a+b;});
      }
      res.render('score', { title: 'Express' , score: score});
    }
    else{
      res.render('score', { title: 'Express' , score: 0});
    }    
  })
})



/* GET home page. */
router.get('/', function (req, res, next) {
  let tags = req.query.tags;
  getTags().then(async result => {
    result = result.map(text => {
      return text.replace(/[^\w\s]/gi, ' ');
    })
    let json;
    let score;
    if (tags) {
      request({
        url: server + '/stream',
        method: 'POST',
        form: { tags: tags }
      }, function (err, response, body) {
        if (!err) {
          json = JSON.parse(body);
          console.log(json);
          console.log('Stream STOP Response: ' + response);
        } else {
          console.log('Unable to connect to stream server!');
        }
      })
      res.redirect('/search?tags=' + tags);

      
    }
    else {
      res.render('index', { title: 'Express', tags: result , score: 0});
    }
  });
});

module.exports = router;


