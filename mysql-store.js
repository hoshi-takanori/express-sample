var mysql = require('mysql');
var bcrypt = require('bcrypt');

var pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASS || 'test_password',
  database: process.env.DB_NAME || 'test_db'
});

module.exports = function (session) {
  var Store = session.Store;

  function MySQLStore(options) {
    Store.call(this, options || {});
    this.debug = options && options.debug;
  }

  MySQLStore.prototype.__proto__ = Store.prototype;

  MySQLStore.prototype.get = function (sid, fn) {
    var debug = this.debug;
    if (debug) console.log('MySQLStore.get: sid = ' + sid);
    var sql = 'select * from sessions where sid = ?';
    pool.query(sql, [sid], function (err, rows) {
      if (err) return fn(err);
      if (debug) console.log('rows =', rows);
      if (! rows || rows.length != 1) return fn();
      var sess = JSON.parse(rows[0].value);
      fn(null, sess);
    });
  }

  MySQLStore.prototype.set = function (sid, sess, fn) {
    var debug = this.debug;
    if (debug) console.log('MySQLStore.set: sid = ' + sid + ', sess =', sess);
    var user = sess.username || null;
    sess = JSON.stringify(sess);
    var sql = 'insert into sessions (sid, value, username, create_date) ' +
        'values (?, ?, ?, now()) on duplicate key update ' +
        'value = ?, username = ?, update_count = update_count + 1';
    pool.query(sql, [sid, sess, user, sess, user], function (err, result) {
      if (err) return fn && fn(err);
      if (debug) console.log('result =', result);
      fn && fn();
    });
  }

  MySQLStore.prototype.destroy = function (sid, fn) {
    var debug = this.debug;
    if (debug) console.log('MySQLStore.destroy: sid = ' + sid);
    var sql = 'delete from sessions where sid = ?';
    pool.query(sql, [sid], function (err, result) {
      if (err) return fn && fn(err);
      if (debug) console.log('result =', result);
      fn && fn();
    });
  }

  return MySQLStore;
};

module.exports.checkPassword = function (username, password, fn) {
  var sql = 'select * from users where name = ?';
  pool.query(sql, [username], function (err, rows) {
    if (err) return fn(err);
    if (! rows || rows.length != 1) return fn();
    bcrypt.compare(password, rows[0].password, fn);
  });
};
