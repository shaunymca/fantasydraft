
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
  machine_learning = require('machine_learning'),
  draft = require('./modules/draft.js'),
  populatedb = require('./modules/populatedb.js');

var app = module.exports = express();

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

app.get('/players', function(req,res) {
  calculations.getPlayers()
  .then(function (output) {
    //console.log(output);
    //players = output;
    res.json(output);
  });
});

app.get('/populatePlayers', function(req,res) {
  populatedb.populatePlayerDB();
});

app.post('/addPlayer', function(req, res) {
  populatedb.addPlayer(req.body)
  .then(function (output) {
    res.json(output);
  });
});
/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
