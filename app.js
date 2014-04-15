var express = require('express');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', { title: 'Express Sample' });
});

app.listen(process.env.PORT || 3000);
