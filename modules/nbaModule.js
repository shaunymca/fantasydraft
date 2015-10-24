var nba = require('nba'),
    mongo = require('./mongoModule.js'),
    mongoose = require('mongoose'),
    Q = require('q'),
    async = require("async");

exports.test = function() {
    nba.api.boxScoreScoring({gameId: "0021201081"}, function (err, response) {
        var keys = [];
        for(var k in response.gameSummary[0]) keys.push(k);

        console.log("total " + keys.length + " keys: " + keys);

        //var date = response.GameSummary.GAME_DATE_EST
        //var result = response.PlayerStats.filter(function (playergamestat) {
        //    return playergamestat.playerId === 2557;
        //})[0];
        //result.date = date
        //console.log(result);
    });
};

exports.players = function() {
    getplayers()
        .then(function (output) {
            mongo.savePlayers();
        }, function (reason) {

        });
};

exports.getplayers = function() {
    nba.ready(function () {
        var fantasySchema = mongoose.Schema({
            firstName : String,
            lastName : String

        },
        { strict : false });
        var Player = mongoose.model('Player', fantasySchema);

        nba.api.playersInfo(function (err, response) {
            players = [];
            mongoPlayerNames(Player)
            .then(function (mplayernames){
                n = response.length - mplayernames.length;
                console.log('starting work on ' + n + ' players, out of ' + response.length);
                console.log(new Date());
                response.forEach(function (player) {
                    var playrName = player.firstName + player.lastName;
                    if (mplayernames.indexOf(playrName) == -1) {
                        getplayerGames(player)
                        .then(function (output) {
                            console.log(new Date() + ' - adding player to mongodb');
                            Player.create(output);
                            console.log(new Date() + " - " + player.firstName + player.lastName + ' ' + player.games.length);
                            n = n - 1;
                            console.log(n + 'players left');
                        });
                    }
                });
            });
        });
    });
};

function mongoPlayerNames(Player) {
    return Q.promise(function(resolve) {
        var array_values = [];
        Player.find(function (err, players) {
            async.map(players,
                function(player, callback){
                    array_values.push(player.firstName + player.lastName);
                    callback();
                },
                function(err){
                    //console.log(array_values);
                    resolve(array_values);
            });
        });

    });
}


function getplayerGames(player){
    return Q.Promise(function(resolve) {
        //console.log("working on getting");
        //console.log(player.firstName + ' ' + player.lastName);
        nba.api.playerProfile({playerId: player.playerId}, function (err, info) {
            getGamesStats(info.graphGameList, player.playerId)
            .then(function (output) {
                player.games = output;
                resolve(player);
            });
        });
    });
}

function getGamesStats(games, playerId) {
    return Q.promise(function(resolve) {
        var player_games = [];
        if(games.length === 0) {
          console.log(games.length + " games for player " + playerId);
        }
        async.map(games, getPlayerGameStats(playerId), function(err, results){
                //console.log(results);
                if (results) {
                    //console.log(playerId + "  games" + results.length + "long");
                    resolve(results);
                } else { console.log("no result");
                }
        });
    });
}

var getPlayerGameStats = function (playerId) {
    return function(game, callback){
        //console.log(game.gameId)
         nba.api.boxScoreScoring({gameId: game.gameId}, function (err, response) {
            var date = response.gameSummary[0].gameDateEst;
            var result = response.playerStats.filter(function (playergamestat) {
                return playergamestat.playerId === playerId;
            })[0];
            result.date = date;
            //console.log(playerId + '  game');
            return callback(null, result);
        });
    };
};
