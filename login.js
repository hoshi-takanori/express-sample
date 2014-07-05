var store;
if (process.env.CUSTOM_STORE) {
  store = require(process.env.CUSTOM_STORE);
}

var checkPassword;
if (store && typeof store.checkPassword == 'function') {
  checkPassword = store.checkPassword;
} else {
  checkPassword = function (username, password, fn) {
    fn(null, username == password);
  };
}

var changePassword;
if (store && typeof store.changePassword == 'function') {
  changePassword = store.changePassword;
}

function getLogin(req, res) {
  if (! req.session.username) {
    res.render('login', {
      error: 'This page is for members only. Please login.'
    });
  } else {
    res.redirect('/');
  }
}

function postLogin(req, res, next) {
  var username = req.param('username');
  var password = req.param('password');
  checkPassword(username, password, function (err, result) {
    if (err) return next(err);
    if (result) {
      req.session.username = username;
      res.redirect('/');
    } else {
      res.render('login', { error: 'Unknown username or password.' });
    }
  });
}

function postLogout(req, res) {
  req.session.destroy();
  res.clearCookie(process.env.COOKIE_NAME || 'connect.sid');
  res.redirect('/');
}

function checkLogin(req, res, next) {
  if (! req.session.username) {
    res.redirect('/login');
  } else {
    next();
  }
}

function getPassword(req, res) {
  res.render('password');
}

function postPassword(req, res, next) {
  var username = req.session.username;
  var current = req.param('current');
  var new1 = req.param('new1');
  var new2 = req.param('new2');
  checkPassword(username, current, function (err, result) {
    if (err) return next(err);
    if (result && new1 == new2 && new1.length >= 6 && new1 != username) {
      changePassword(username, new1, function (err, result) {
        if (err) return next(err);
        if (result) {
          req.session.destroy();
          res.clearCookie(process.env.COOKIE_NAME || 'connect.sid');
          res.render('login', {
            title: 'Change Password',
            good: 'Your password has been changed successfully. Please login again.'
          });
        } else {
          res.render('password', { error: 'Failed to change your password.' });
        }
      });
    } else {
      res.render('password', { error: 'Bad password.' });
    }
  });
}

exports.setup = function (app) {
  app.get('/login', getLogin);
  app.post('/login', postLogin);
  app.post('/logout', postLogout);

  app.use(checkLogin);

  if (changePassword) {
    app.get('/password', getPassword);
    app.post('/password', postPassword);
  }
};
