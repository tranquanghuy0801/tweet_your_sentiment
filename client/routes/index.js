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





/* GET home page. */
router.get('/', function (req, res, next) {
  let tags = req.query.tags;
  getTags().then(result => {
    result = result.map(text => {
      return text.replace(/[^\w\s]/gi, ' ');
    })
    let json;
    if (tags) {
      request({
        url: server + '/stream',
        method: 'POST',
        form: { tags: tags }
      }, function (err, res, body) {
        if (!err) {
          json = JSON.parse(body);
          console.log(json);
          console.log('Stream STOP Response: ' + res);
        } else {
          console.log('Unable to connect to stream server!');
        }
      })
      let options = {
        url: server + '/stats',
        qs: {
          tags: tags
        }
      };
      request.get(options,function(err,res,body){
          let json = JSON.parse(body);
          console.log(json);
      })
      res.render('index', { title: 'Express', tags: result });
    }
    else {
      res.render('index', { title: 'Express', tags: result });
    }
  });
});

module.exports = router;
