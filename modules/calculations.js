var utilities = require('./utilities.js');
var stats = {"threePointersMade":"3pt",
              "assists":"apg",
              "blocks":"bpg",
              "fieldGoalPercentage": "fgp",
              "freeThrowPercentage":"ftp",
              "points": "ppg",
              "steals":"spg",
              "turnOvers":"tpg",
              "totalRebounds":"rpg"};

var players = utilities.forcasts();
var distribution = {};


//console.log(distribution);
exports.distribution = function() {
  Object.keys(stats).forEach(function (statkey) {
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
    player.superscore = 0;
    for (var key in player.zscores) {
      zarray.push(player.zscores[key]);
      player.superscore += player.zscores[key];
      //console.log(zarray);
      player.averagez = average(zarray);
    }
  });
  return(players);
  //players.forEach(function (player) {
  //  console.log(player.playername + ',' + player.superscore + ',' + player.averagez);
  //  //if(player.playername == 'Stephen Curry' || player.playername == "Anthony Davi") {
  //  //  console.log(player);
  //  //}
  //});
};

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
