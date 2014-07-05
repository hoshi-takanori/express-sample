var morgan = require('morgan');
var fs = require('fs');

morgan.token('username', function (req, res) {
  return req.session && req.session.username;
});

module.exports = function (app, format) {
  if (app.get('env') == 'production' && ! format) {
    if (process.env.TRUST_PROXY) {
      format = ':req[x-forwarded-for] - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
    } else {
      format = ':remote-addr - :username [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
    }
    var logfile = app.get('get_path')(process.env.LOG_FILE || 'log.txt');
    var stream = fs.createWriteStream(logfile, { flags: 'a' });
    return morgan({ format: format, stream: stream });
  } else if (format && format != 'dev') {
    if (format == 'short') {
      format = ':remote-addr :username :method :url HTTP/:http-version :status :res[content-length] - :response-time ms';
    }
    return morgan(format);
  } else {
    return morgan({ format: 'dev', immediate: true });
  }
};
