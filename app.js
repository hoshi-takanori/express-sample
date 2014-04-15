var express = require('express');
var mysql = require('mysql');
var app = express();

var connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASS || 'test_password',
  database: process.env.DB_NAME || 'test_db'
});

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', { title: 'Express Sample' });
});

app.get('/users', function(req, res) {
  connection.query('select * from users', function(err, rows) {
    res.render('users', { title: 'Express Users', users: rows });
  });
});

app.listen(process.env.PORT || 3000);
