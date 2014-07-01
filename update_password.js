var mysql = require('mysql');
var bcrypt = require('bcrypt');

var conn = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASS || 'test_password',
  database: process.env.DB_NAME || 'test_db'
});

if (process.argv.length == 3) {
  inputStdin(function (password) {
    updatePassword(process.argv[2], password, process.exit);
  });
} else if (process.argv.length == 4) {
  updatePassword(process.argv[2], process.argv[3], process.exit);
} else {
  console.log('usage: node ' + process.argv[1] + ' username [password]');
  process.exit(1);
}

function inputStdin(fn) {
  var input = '';
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    input += chunk;
  });
  process.stdin.on('end', function () {
    input = input.split('\n');
    fn(input[0]);
  });
}

function updatePassword(username, password, fn) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  var sql = 'update users set password = ? where name = ?';
  conn.query(sql, [hash, username], function (err, result) {
    if (err) {
      console.log('ERROR:', err);
    } else {
      console.log('result =', result);
    }
    fn && fn();
  });
}
