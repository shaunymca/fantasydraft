
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  path = require('path'),
  mongo = require('./modules/mongoModule.js'),
  nba = require('./modules/nbaModule.js'),
  analyze = require('./modules/analyze.js'),
  calculations = require('./modules/calculations.js'),
  annealing = require('./modules/annealing.js'),
  machine_learning = require('machine_learning');

var app = module.exports = express();

var db = mongo.connect();
//nba.players();
//db.once('open', function (callback) {
  players = calculations.distribution();
  annealing.annealing();
  //nba.getplayers();
  //nba.test();
  //analyze.players();
//});
/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

var env = process.env.NODE_ENV || 'development';

// development only
// if (env === 'development') {
//   app.use(express.errorHandler());
// }

// production only
if (env === 'production') {
  // TODO
}


/**
 * Routes
 */

app.get('/', function(req, res) {
  res.sendfile(__dirname + "/public/js/partials/index.html");
});

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
