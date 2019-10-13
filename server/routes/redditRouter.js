"use strict";

const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const bucketName = 'cab432-reddit-comments';
const helper = require('../aws_store');
// Create a promise on S3 service object
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise(); bucketPromise
    .then(function (data) {
        console.log("Successfully created " + bucketName);
    })
    .catch(function (err) {
        console.error(err, err.stack);
    });


// Router
router.use(function (req, res, next) {
    console.log("Reddit Comment Stream Incoming: /" + req.method);
    next();
});

// Index Router (Health Check)
router.get('/', function (req, res) {
    console.log("Index");
});

// Receive POST from Reddit comment stream
router.post('/',function (req, res) {
    helper.store_comment(req.body);
    
});


module.exports = router;