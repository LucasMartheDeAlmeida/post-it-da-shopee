require('dotenv-safe').config();

const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const auth = require('./routes/middleware.js');

const con = mysql.createConnection({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER, 
    password: process.env.MYSQL_PWD, 
    database: process.env.MYSQL_DB, 
    port: process.env.MYSQL_PORT, 
    ssl: {
        ca: fs.readFileSync("./config/ssl.crt.pem")
    }
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

con.connect((err) => {
  if (err) {
      console.log(process.env.MYSQL_USER)
      console.log('Erro connecting to database...', err);
      return
  }

  console.log('Connection established!');
});

require('./routes')(app, con, auth);

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