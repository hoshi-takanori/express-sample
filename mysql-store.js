var mysql = require('mysql');

var pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASS || 'test_password',
  database: process.env.DB_NAME || 'test_db'
});

function query(sql, arr, fn) {
  pool.getConnection(function (err, conn) {
    if (err) return fn(err);
    conn.query(sql, arr, function (err, result) {
      conn.release();
      fn(err, result);
    });
  });
}

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
    query(sql, [sid], function (err, rows) {
      if (err) return fn(err);
      if (debug) console.log('rows =', rows);
      if (! rows || rows.length != 1) return fn();
      var sess = JSON.parse(rows[0].value);
      fn(null, sess);
    });
  }

  MySQLStore.prototype.set = function (sid, sess, fn) {
    var debug = this.debug;
    if (debug) console.log('MySQLStore.set: sid = ' + sid);
    sess = JSON.stringify(sess);
    var sql = 'insert into sessions (sid, value, create_date) ' +
        'values (?, ?, now()) on duplicate key update ' +
        'value = ?, update_count = update_count + 1';
    query(sql, [sid, sess, sess], function (err, result) {
      if (err) return fn && fn(err);
      if (debug) console.log('result =', result);
      fn && fn();
    });
  }

  MySQLStore.prototype.destroy = function (sid, fn) {
    var debug = this.debug;
    if (debug) console.log('MySQLStore.destroy: sid = ' + sid);
    var sql = 'delete from sessions where sid = ?';
    query(sql, [sid], function (err, result) {
      if (err) return fn && fn(err);
      if (debug) console.log('result =', result);
      fn && fn();
    });
  }

  return MySQLStore;
};
