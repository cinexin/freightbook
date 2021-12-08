require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const logger = require('morgan');

const passport = require('passport');
require('./mvc/models/db')
var indexRouter = require('./mvc/routes/index');
var usersRouter = require('./mvc/routes/users');

var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'mvc', 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'angular', 'build')));
app.use(methodOverride());

app.use(function(req, res, next) {
  res.statusJson = function(statusCode, data) {
    const obj = {
      ...data,
      statusCode: statusCode
    }
    res.status(statusCode).json(obj);
  }
  next();
});
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'angular', 'build', 'index.html'));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
