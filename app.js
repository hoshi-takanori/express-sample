var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

app.set('title', 'Express Sample');
app.set('get_path', function (name) {
  return name.lastIndexOf('/', 0) == 0 ? name : __dirname + '/' + name;
});

app.set('view engine', 'jade');
app.set('views', app.get('get_path')('views'));

require('./logger').setup(app, 'public');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require('./session').setup(app);
require('./login').setup(app);

app.get('/', function (req, res) {
  res.render('index', {
    username: req.session.username,
    links: [
      { href: '/aaa', text: 'AAA' },
      { href: '/bbb', text: 'BBB' },
      { href: '/ccc', text: 'CCC' }
    ]
  });
});

app.get('/aaa', function (req, res) {
  res.render('index', { title: 'AAA', message: 'Welcome to AAA.' });
});

app.get('/bbb', function (req, res) {
  res.render('index', { title: 'BBB', message: 'Welcome to BBB.' });
});

app.get('/ccc', function (req, res) {
  res.render('index', { title: 'CCC', message: 'Welcome to CCC.' });
});

require('./error').setup(app);

app.listen(process.env.PORT || 3000);
