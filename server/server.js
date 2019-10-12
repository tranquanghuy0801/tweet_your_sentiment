const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const viewsPath = __dirname + '/views/';
const redditRouter = require('./routes/redditRouter');
const app = express();
const server = require('http').Server(app);

// Client side body and cookie parsing
app.use(bodyParser.urlencoded({	extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Web page routing
app.use('/reddit', redditRouter);

module.exports = {app: app, server: server};
