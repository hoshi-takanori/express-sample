var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

if (app.get('env') == 'production' && ! process.env.LOG_FORMAT) {
  var fs = require('fs');
  var stream = fs.createWriteStream(__dirname + '/log.txt', { flags: 'a' });
  app.use(morgan({ stream: stream }));
} else if (process.env.LOG_FORMAT && process.env.LOG_FORMAT != 'dev') {
  app.use(morgan(process.env.LOG_FORMAT));
} else {
  app.use(morgan({ format: 'dev', immediate: true }));
}
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var cookieName = 'connect.sid';
app.use(session({
  name: cookieName,
  secret: process.env.SESSION_SECRET || 'session secret',
  resave: true,
  saveUninitialized: false
}));

app.get('/', function (req, res) {
  var username = req.session.username;
  res.render('index', { title: 'Express Sample', username: username });
});

app.post('/login', function (req, res) {
  var username = req.param('username');
  var password = req.param('password');
  if (username == password) {
    req.session.username = username;
    res.redirect('/');
  } else {
    res.render('index', { title: 'Express Sample', error: 'Unknown username or password.' });
  }
});

app.post('/logout', function (req, res) {
  req.session.destroy();
  res.clearCookie(cookieName);
  res.redirect('/');
});

app.listen(process.env.PORT || 3000);
