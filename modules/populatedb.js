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
        client.query('Insert into players (player, g, mpg, fg, fgp, ft, ftp, pt, ptp, rpg, apg, spg, tpg, bpg, ppg, fpts, position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',
          [player.player, player.g, player.mpg, player.fg, player.fgp, player.ft, player.ftp, player.pt, player.ptp, player.rpg, player.apg, player.spg, player.tpg, player.bpg, player.ppg, player.fpts, player.position], function(err, result) {
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
      client.query('Insert into players (player, g, mpg, fg, fgp, ft, ftp, pt, ptp, rpg, apg, spg, tpg, bpg, ppg, fpts, position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id',
        [player.player, player.g, player.mpg, player.fg, player.fgp, player.ft, player.ftp, player.pt, player.ptp, player.rpg, player.apg, player.spg, player.tpg, player.bpg, player.ppg, player.fpts, player.position], function(err, result) {
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
