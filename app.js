var express = require('express');
var morgan = require('morgan');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

if (app.get('env') == 'production') {
  var fs = require('fs');
  var stream = fs.createWriteStream(__dirname + '/log.txt', { flags: 'a' });
  app.use(morgan({ stream: stream }));
} else {
  //app.use(morgan('short'));
  app.use(morgan({ format: 'dev', immediate: true }));
}
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', { title: 'Express Sample' });
});

app.listen(process.env.PORT || 3000);
