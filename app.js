var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

morgan.token('username', function (req, res) {
  return req.session && req.session.username;
});
if (app.get('env') == 'production' && ! process.env.LOG_FORMAT) {
  var format;
  if (process.env.TRUST_PROXY) {
    format = ':req[x-forwarded-for] - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  } else {
    format = ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  }
  var fs = require('fs');
  var stream = fs.createWriteStream(__dirname + '/log.txt', { flags: 'a' });
  app.use(morgan({ format: format, stream: stream }));
} else if (process.env.LOG_FORMAT && process.env.LOG_FORMAT != 'dev') {
  app.use(morgan(process.env.LOG_FORMAT));
} else {
  app.use(morgan({ format: 'dev', immediate: true }));
}
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var cookieName = 'connect.sid';
var sessionParams = {
  name: cookieName,
  secret: process.env.SESSION_SECRET || 'session secret',
  resave: true,
  saveUninitialized: false
};
if (process.env.CUSTOM_STORE) {
  var store = require(process.env.CUSTOM_STORE)(session);
  sessionParams.store = new store({ debug: process.env.DEBUG_STORE });
}
if (app.get('env') == 'production') {
  sessionParams.cookie = { secure: true };
  if (process.env.TRUST_PROXY) {
    sessionParams.proxy = true;
  }
}
if (process.env.COOKIE_HACK || process.env.DEBUG_SESSION) {
  var uid = require('express-session/node_modules/uid-safe').sync;
  sessionParams.genid = function (req) {
    req.sessionID_isNew = true;
    return uid(24);
  };
}
app.use(session(sessionParams));

if (process.env.DEBUG_SESSION) {
  app.use(function (req, res, next) {
    var str = 'session id = ' + req.sessionID;
    if (req.sessionID_isNew) {
      str += ' (new)';
    } else if (req.session.username) {
      str += ', username = ' + req.session.username;
    }
    console.log(str);
    next();
  });
}

if (process.env.COOKIE_HACK) {
  var hack = require(process.env.COOKIE_HACK);
  app.get('/set-cookie', hack.setCookie);
  app.get('/get-cookie', hack.getCookie);
  app.use(hack.checkCookie);
}

app.get('/', function (req, res) {
  if (! req.session.username) {
    res.render('index', { title: 'Express Sample' });
  } else {
    res.render('index', {
      title: 'Express Sample',
      username: req.session.username,
      links: [
        { href: '/aaa', text: 'AAA' },
        { href: '/bbb', text: 'BBB' },
        { href: '/ccc', text: 'CCC' }
      ]
    });
  }
});

app.get('/login', function (req, res) {
  if (! req.session.username) {
    res.render('index', { title: 'Express Sample', error: 'This page is for members only. Please login.' });
  } else {
    res.redirect('/');
  }
});

var checkPassword = function (username, password, fn) {
  fn(null, username == password);
};
if (process.env.CUSTOM_STORE) {
  var store = require(process.env.CUSTOM_STORE);
  if (typeof store.checkPassword == 'function') {
    checkPassword = store.checkPassword;
  }
}

app.post('/login', function (req, res, next) {
  var username = req.param('username');
  var password = req.param('password');
  checkPassword(username, password, function (err, result) {
    if (err) return next(err);
    if (result) {
      req.session.username = username;
      res.redirect('/');
    } else {
      res.render('index', { title: 'Express Sample', error: 'Unknown username or password.' });
    }
  });
});

app.post('/logout', function (req, res) {
  req.session.destroy();
  res.clearCookie(cookieName);
  res.redirect('/');
});

app.use(function (req, res, next) {
  if (! req.session.username) {
    res.redirect('/login');
  } else {
    next();
  }
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

app.listen(process.env.PORT || 3000);
