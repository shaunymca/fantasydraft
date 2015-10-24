var utilities = require('./utilities.js'),
    pg = require('pg'),
    Q = require('q');

pg.defaults.poolIdleTimeout = 12000000;
pg.defaults.poolSize = 20;
var conString = "postgres://shaun:gsemtart@fantasy.cwaxcaqtuuuv.us-west-2.rds.amazonaws.com/fantasy";

// Pulls from the list in utilities.js and populates the db. Really only need to run this when the database is new.
exports.populatePlayerDB = function() {
  var players = utilities.forcasts();
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('TRUNCATE players', function(err, result) {
      //call `done()` to release the client back to the pool
      done();
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result);
      players.forEach(function (player) {
        var player_values = [];
        for (var key in player) {
            player_values.push(player[key]);
        }
        client.query('Insert into players (player, games, threepointersmade, assists, blocks, fieldgoalpercentage, freethrowpercentage, points, steals, turnovers, totalrebounds, position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
          [player.player, player.games, player.threepointersmade, player.assists, player.blocks, player.fieldgoalpercentage, player.freethrowpercentage, player.points, player.steals, player.turnovers, player.totalrebounds, player.position], function(err, result) {
          //call `done()` to release the client back to the pool
          done();

          if(err) {
            return console.error('error running query', err);
          }
          //console.log(result);
          //output: 1
        });
      });
      //output: 1
    });
  });
};

// Returns a promise that will resolve the full list of players
exports.getPlayers = function() {
  return Q.promise(function(resolve) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('SELECT * from players', function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result.rows);
        resolve(result.rows);
        //output: 1
      });
    });
  });
};

// Accepts a player object and returns a promise that resolves the player back from the db.
exports.addPlayer = function(player) {
  return Q.promise(function(resolve) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('Insert into players (player, games, threepointersmade, assists, blocks, fieldgoalpercentage, freethrowpercentage, points, steals, turnovers, totalrebounds, position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
        [player.player, player.games, player.threepointersmade, player.assists, player.blocks, player.fieldgoalpercentage, player.freethrowpercentage, player.points, player.steals, player.turnovers, player.totalrebounds, player.position], function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result.rows);
        resolve(result.rows[0].id);
        //output: 1
      });
    });
  });
};

// Returns a promise that will resolve the full list of players
exports.getTeams = function() {
  return Q.promise(function(resolve) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('SELECT * from teams', function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result.rows);
        resolve(result.rows);
        //output: 1
      });
    });
  });
};

// Accepts a player object and returns a promise that resolves the player back from the db.
exports.addTeam = function(team) {
  return Q.promise(function(resolve) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query((
        ' INSERT INTO teams' +
        ' (name)' +
        '  VALUES ($1)'),
        [team.name],
        function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        //console.log(result.rows);
        resolve(result.rows[0].id);
        //output: 1
      });
    });
  });
};
