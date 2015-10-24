var utilities = require('./utilities.js'),
    pgdb = require('./populatedb.js'),
    Q = require('q');

var stats = {"threepointersmade": "threepointersmade",
              "assists": "assists",
              "blocks": "blocks",
              "fieldgoalpercentage": "fieldgoalpercentage",
              "freethrowpercentage": "freethrowpercentage",
              "points": "points",
              "steals": "steals",
              "turnovers": "turnovers",
              "totalrebounds": "totalrebounds"};
var distribution = {};

var players = [];
// Returns a promise. This function grabs players from the db and runs them through the distribution function. Each category has it's own z-score compared to other players and getPlayers returns the final list.
exports.getPlayers = function() {
  return Q.promise(function(resolve) {
    pgdb.getPlayers()
    .then(function (output) {
      players = output;
      //console.log(players);
      var playerstats = distributionofPlayers();
      //console.log('playerstats' + playerstats);
      resolve(playerstats);
    });
  });
};

//console.log(distribution);
function distributionofPlayers() {
  Object.keys(stats).forEach(function (statkey) {
    //console.log('hello');
     distribution[statkey] = [];
     //console.log(statkey);
     players.forEach(function (player) {
       player.zscores = {};
       keydist(player, statkey);
     });
  });
  Object.keys(stats).forEach(function (statkey) {
    mean = average(distribution[statkey]);
    standardDev = standardDeviation(distribution[statkey], statkey);
    //console.log(standardDev);
    //console.log(mean);
    players.forEach(function (player) {
      //if(player.playername == 'Stephen Curry') {
      //  console.log(statkey + " mean : " + mean);
      //  console.log(statkey + " standardDev: " + standardDev);
      //  console.log(statkey + ' start ' + (player[stats[statkey]] - mean));
      //  console.log(statkey + ' zscore ' + ((player[stats[statkey]] - mean) / standardDev));
      //}
      player.zscores[stats[statkey]] = ((player[stats[statkey]] - mean) / standardDev);
      //console.log((player[stats[statkey]] - mean) / standardDev);
    });
  });
  //console.log(players);
  players.forEach(function (player) {
    zarray = [];
    player.sumzscores = 0;
    for (var key in player.zscores) {
      zarray.push(player.zscores[key]);
      player.sumzscores += player.zscores[key];
      //console.log(zarray);
      player.averagez = average(zarray);
    }
  });
  return players;
  //players.forEach(function (player) {
  //  console.log(player.playername + ',' + player.sumzscores + ',' + player.averagez);
  //  //if(player.playername == 'Stephen Curry' || player.playername == "Anthony Davi") {
  //  //  console.log(player);
  //  //}
  //});
}

function keydist(player, statkey) {
  stat = stats[statkey];
  player_stat = player[stat];
  distribution[statkey].push(player_stat);
}

function standardDeviation(object, statKey) {
  //console.log(statKey);
  objectMean = average(object);
  varianceInput = 0;
  var arrayLength = object.length;
  for (var i = 0; i < arrayLength; i++) {
    varianceInput =+ (object[i] - objectMean) * (object[i] - objectMean);
  }
  var variance = varianceInput / objectMean;
  //console.log("\n Variance " + statKey + " " + variance);
  var standardDev = Math.sqrt(variance);
  //console.log(statKey + " " + standardDev);
  return(Math.sqrt(variance));
}

var average = function(myarray) {
  var sum = 0;
  for (var counter = 0; counter < myarray.length; counter++) {
    sum += myarray[counter];
   }
   return sum / myarray.length;
};
