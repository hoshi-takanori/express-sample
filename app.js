var express = require('express');
var logger = require('./logger');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('./session');
var login = require('./login');
var error = require('./error');
var app = express();

app.set('title', 'Express Sample');
app.set('get_path', function (name) {
  return name.lastIndexOf('/', 0) == 0 ? name : __dirname + '/' + name;
});

app.set('view engine', 'jade');
app.set('views', app.get('get_path')('views'));

app.use(logger(app, process.env.LOG_FORMAT));
app.use(express.static(app.get('get_path')('public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

session.setup(app);

app.get('/', function (req, res) {
  if (! req.session.username) {
    res.render('login');
  } else {
    res.render('index', {
      username: req.session.username,
      links: [
        { href: '/aaa', text: 'AAA' },
        { href: '/bbb', text: 'BBB' },
        { href: '/ccc', text: 'CCC' }
      ]
    });
  }
});

login.setup(app);

app.get('/aaa', function (req, res) {
  res.render('index', { title: 'AAA', message: 'Welcome to AAA.' });
});

app.get('/bbb', function (req, res) {
  res.render('index', { title: 'BBB', message: 'Welcome to BBB.' });
});

app.get('/ccc', function (req, res) {
  res.render('index', { title: 'CCC', message: 'Welcome to CCC.' });
});

app.use(error.notFound);
app.use(error.errorHandler);

app.listen(process.env.PORT || 3000);
