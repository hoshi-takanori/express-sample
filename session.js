var session = require('express-session');

function sessionParams(env) {
  var params = {
    name: process.env.COOKIE_NAME || 'connect.sid',
    secret: process.env.SESSION_SECRET || 'session secret',
    resave: true,
    saveUninitialized: false
  };

  if (process.env.CUSTOM_STORE) {
    var store = require(process.env.CUSTOM_STORE)(session);
    params.store = new store({ debug: process.env.DEBUG_STORE });
  }

  if (env == 'production') {
    params.cookie = { secure: true };
    if (process.env.TRUST_PROXY) {
      params.proxy = true;
    }
  }

  if (process.env.COOKIE_HACK || process.env.DEBUG_SESSION) {
    var uid = require('express-session/node_modules/uid-safe').sync;
    params.genid = function (req) {
      req.sessionID_isNew = true;
      return uid(24);
    };
  }

  return params;
}

function debugSession(req, res, next) {
  var str = 'session id = ' + req.sessionID;
  if (req.sessionID_isNew) {
    str += ' (new)';
  } else if (req.session.username) {
    str += ', username = ' + req.session.username;
  }
  console.log(str);
  next();
}

exports.setup = function (app) {
  app.use(session(sessionParams(app.get('env'))));

  if (process.env.DEBUG_SESSION) {
    app.use(debugSession);
  }

  if (process.env.COOKIE_HACK) {
    var hack = require(process.env.COOKIE_HACK);
    app.get('/set-cookie', hack.setCookie);
    app.get('/get-cookie', hack.getCookie);
    app.use(hack.checkCookie);
  }
};
