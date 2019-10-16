const express = require('express');
const request = require('request');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/subreddit',function(req,res){
  let subreddit = req.query.key;

})

module.exports = router;
