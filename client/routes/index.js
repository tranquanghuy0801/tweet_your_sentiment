const express = require('express');
const request = require('request');
const router = express.Router();
const server = "http://localhost:3002/stream";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', function (req, res, next) {
  let tags = req.query.tags;
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
  res.sendStatus(200);
});

module.exports = router;
