var express = require('express');
var morgan = require('morgan');
var fs = require('fs');

morgan.token('username', function (req, res) {
  return req.session && req.session.username;
});

function fileLogger(app) {
  if (process.env.TRUST_PROXY) {
    format = ':req[x-forwarded-for] - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  } else {
    format = ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  }
  var logfile = app.get('get_path')(process.env.LOG_FILE || 'log.txt');
  var stream = fs.createWriteStream(logfile, { flags: 'a' });
  return morgan({ format: format, stream: stream });
}

function logger(format) {
  if (format && format != 'dev') {
    if (format == 'short') {
      format = ':remote-addr :username :method :url HTTP/:http-version :status :res[content-length] - :response-time ms';
    }
    return morgan(format);
  } else {
    return morgan({ format: 'dev', immediate: true });
  }
}

exports.setup = function (app, public) {
  if (app.get('env') == 'production' && ! process.env.LOG_FORMAT) {
    app.use(express.static(app.get('get_path')(public)));
    app.use(fileLogger(app));
  } else {
    app.use(logger(process.env.LOG_FORMAT));
    app.use(express.static(app.get('get_path')(public)));
  }
};
