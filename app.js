var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

if (app.get('env') == 'production') {
  var fs = require('fs');
  var stream = fs.createWriteStream(__dirname + '/log.txt', { flags: 'a' });
  app.use(morgan({ stream: stream }));
} else {
  //app.use(morgan('short'));
  app.use(morgan({ format: 'dev', immediate: true }));
}
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(cookieParser('cookie secret'));

app.get('/', function(req, res) {
  var username = req.cookies.username;
  //var username = req.signedCookies.username;
  res.render('index', { title: 'Express Sample', username: username });
});

app.post('/', function(req, res) {
  if (req.param('logout')) {
    res.clearCookie('username');
    res.redirect('/');
    return;
  }
  var username = req.param('username');
  var password = req.param('password');
  if (username == password) {
    res.cookie('username', username);
    //res.cookie('username', username, { signed: true });
    res.redirect('/');
  } else {
    res.render('index', { title: 'Express Sample', error: 'Unknown username or password.' });
  }
});

app.listen(process.env.PORT || 3000);
