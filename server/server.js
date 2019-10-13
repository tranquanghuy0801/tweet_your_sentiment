const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const viewsPath = __dirname + '/views/';
const redditRouter = require('./routes/redditRouter');
const app = express();
port = 3000;
const server = require('http').Server(app);

// Client side body and cookie parsing
app.use(bodyParser.urlencoded({	extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Web page routing
app.use('/reddit', redditRouter);

app.listen(port, function () {
    console.log(`Express app listening at http://localhost:${port}/`);
});

module.exports = {app: app, server: server};
