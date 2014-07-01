var debug = process.env.DEBUG_HACK;

exports.setCookie = function (req, res) {
  if (debug) console.log('setCookie: headers =', req.headers);
  if (req.sessionID_isNew) {
    req.headers['x-forwarded-proto'] = 'https';
    req.session.username = null;
    res.redirect('/get-cookie');
  } else {
    res.redirect('/');
  }
};

exports.getCookie = function (req, res) {
  if (debug) console.log('getCookie: headers =', req.headers);
  if (req.sessionID_isNew) {
    res.render('index', { title: 'Express Sample', message: 'No cookie...' });
  } else {
    res.redirect('/');
  }
};

exports.checkCookie = function (req, res, next) {
  if (debug) console.log('checkCookie: headers =', req.headers);
  if (req.sessionID_isNew) {
    var url = '/set-cookie';
    if (req.get('x-forwarded-host')) {
      url = 'https://' + req.get('x-forwarded-host') + url;
    }
    res.redirect(url);
  } else {
    next();
  }
};
