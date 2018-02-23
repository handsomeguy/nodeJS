var express = require('express');
var fs = require('fs');
var events = require('events');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser=require('body-parser');
var multer  = require('multer');
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("connect database ok!");
});
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: '/public/'}).array('file'));
app.use(cookieParser());
app.use(session({
  secret: '12345',
  name: 'name',
  cookie: {maxAge: 300000},
  resave: false,
  saveUninitialized: true
}));
//设置允许跨域请求
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin",null);
//    res.header("Access-Control-Allow-Origin", req.headers['Origin']);
//    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Access-Control-Allow-Credentials","true"); //是否支持cookie跨域
//    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//var moment = require('moment');
//var a = new Date();
//console.log(a);
//var b = moment(a).format('YYYY-MM-DD HH:mm:ss');
//console.log(b);

require('./route/routes')(app);
app.listen(80,function(){
    console.log('the server has been running');
});