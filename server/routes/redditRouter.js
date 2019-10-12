const express = require('express');
const AWS = require('aws-sdk');

const router = express.Router();
AWS.config = new AWS.Config();
AWS.config.loadFromPath('./config/aws_config.json');
// Router
router.use(function (req, res, next) {
    console.log("Reddit Comment Stream Incoming: /" + req.method);
    next();
});

// Index Router (Health Check)
router.get('/', function (req, res) {
    console.log("AWS Load Balancer Health Check here");
});

// Receive POST from Reddit comment stream
router.post('/', function (req, res) {
	console.log(req.body);
});


module.exports = router;