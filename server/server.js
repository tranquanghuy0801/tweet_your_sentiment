const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const viewsPath = __dirname + '/views/';
const twitterRouter = require('./routes/twitterRouter');
const app = express();
const port = 3001;
const server = require('http').Server(app);

// Client side body and cookie parsing
app.use(bodyParser.urlencoded({	extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Web page routing
app.use('/', twitterRouter);

app.listen(port, function () {
    console.log(`Express app listening at http://localhost:${port}/`);
});

module.exports = {app: app, server: server};
