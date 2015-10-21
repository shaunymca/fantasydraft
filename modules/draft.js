var playerStats = require('./calculations.js');

exports.run = function() {
  playerScores();
};

function playerScores() {
  var r = Math.random(0,1);
  console.log(r);
  var leagueGames = 82;
  var players = playerStats.distribution();
  players.forEach(function (player) {
    if (r < (player.g / leagueGames)) {
      gamePlayed = false;
      return gamePlayed;
    }
    else {
      gamePlayed = true;
      return gamePlayed;
    }
  });
}
