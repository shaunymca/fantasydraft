var nba = require('./nbaModule'),
    mongo = require('./mongoModule.js'),
    mongoose = require('mongoose'),
    Q = require('q'),
    async = require("async"),
    utilities = require('./utilities.js');


var stats = {"threePointersMade":"fG3M", "assists":"aST", "blocks":"bLK", "fieldGoalPercentage": "fgPct", "freeThrowPercentage":"ftPct", "points": "pTS", "steals":"sTL", "turnOvers":"tO", "totalRebounds":"rEB"};

var statsBenchMark = {};

exports.players = function() {
  mongo.getPlayers()
    .then(function (output) {
      async.filter(output, topPlayers, function(results) {
        for (var value in stats){
          console.log(results.length);
          runStats(results, stats, value);
        }
      });
      //console.log(output);
    });
};

function topPlayers(player, callback) {
  mongoName = player.firstName + " " + player.lastName;
  var players = utilities.players();
  //console.log(players);
  //console.log(players.indexOf(mongoName));
  var playerPosition = players.indexOf(mongoName);
  if (playerPosition === -1)
    return callback(0);
  else
    return callback(1);
}

function runStats(players, stats, value) {
  async.map(players, playerMean(stats[value], value), function(err, results){
   //console.log(value);
    total = 0;
    results.forEach(function (item) {
      total += item["avg"+value];
    });
    statsBenchMark["mean" + stats[value]] = total/players.length;
    console.log("statsBenchMark.mean"+value + ": " + statsBenchMark["mean"+stats[value]]);
  });
}

function playerMean(stat, value) {
  return function(player, callback){
    total = 0;
    var playerAvg = {};
    playerAvg.playerId = player.playerId;
    player.games.forEach(function (item) {
      total += item[stat];
    });
    playerAvg["avg"+value] = total / player.games.length;
    return callback(null, playerAvg);
  };
}

function playerMedian(stat,value) {
  return function(player, callback){
    var playerMedian = {};
    playerMedian.playerId = player.playerId;
    stat_array = [];
    player.games.forEach(function (item) {
      stat_array.push(item[stat]);
    });
    stat_array.sort( function(a,b) {return a - b;} );
    var half = Math.floor(stat_array.length/2);
    if(stat_array.length % 2) {
        playerMedian["median"+value] = stat_array[half];
        return callback(null, playerMedian);
    } else {
        playerMedian.median = (stat_array[half-1] + stat_array[half]) / 2.0;
        return callback(null, playerMedian);
    }
  };
}

function playerTotal(stat,value) {
    return function(player, callback){
      var playerSum = {};
      var total = 0;
      playerSum.playerId = player.playerId;
      player.games.forEach(function (item) {
        total += item[stat];
      });
      playerSum["total"+value] = total;
      return callback(null, playerSum);
    };
}
