
/**
 * Module dependencies
 */
"use strict";
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
  populatedb = require('./modules/populatedb.js'),
  Q = require('q');

var app = module.exports = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
//app.use(express.static(__dirname + '/public'));

/**
 * Routes
 */
var DB_PLAYERS = [];
calculations.getPlayers().then(function(output) {
  // Please initialize all of the needed classes here, so we can call them in the api
  var DB_PLAYERS = output;
  var league = new League(DB_PLAYERS);
  var players = new PlayerPool(DB_PLAYERS);
  // API SECTION
  app.get('/', function(req, res) {
    res.sendfile(__dirname + "/public/js/partials/index.html");
  });
  // LEAGUE SETTINGS:
  // Get the league object
  app.get('/league', function(req,res) {
    //console.log(players);
    res.json(league);
  });
  // Add team to the league
  app.post('addteam', function(req,res) {
    // this should add a team to the database and also to the League class. The req will include the team name, and anything else you need.
  });

  app.get('nextpickforteam', function(req,res) {
    // this should get the next pick for the team passed to it from the req.
    // ex  - [team:12]
  });

  app.get('/players', function(req,res) {
    // this gets the current player pool
    res.json(players);
  });

  app.get('/populatePlayers', function(req,res) {
    // this populates the database table for players. DO NOT RUN UNLESS YOU KNOW WHAT YOU'RE DOING
    populatedb.populatePlayerDB();
  });

  app.post('/addPlayer', function(req, res) {
    //This should add a new player to the db, but it needs to add a player to the playerpool also.
    populatedb.addPlayer(req.body)
    .then(function (output) {
      res.json(output);
    });
  });

  app.post('/removePlayer', function(req,res) {
    //this will remove a player from the POOL, but not the db. This will be used if I find out that a player is injured or something.
    // I'll rerun the player pick stuff after this so no need to rerun that here.
  });

  app.get('/predictDraft', function(req, res) {
    //this needs to predict the drafts. This might not be neccesary if nextpickforteam will do this automatically and find the player.
  });

  app.get('/bower_components/*', function(req, res) {
    res.sendfile(__dirname + req.originalUrl);
  });

  app.get('/public/*', function(req, res) {
    console.log('something');
    res.sendfile(__dirname + req.originalUrl);
  });
});

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});



var games_in_season = 82; //https://en.m.wikipedia.org/wiki/National_Basketball_Association#Regular_season
var players_allowed_on_team = 15;

var deep_copy = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

class Score {
	constructor(threepointersmade, assists, blocks, fieldgoalpercentage, freethrowpercentage, points, steals, turnovers,totalrebounds) {
		this.score_map = {
			threepointersmade: threepointersmade,
			assists: assists,
      blocks: blocks,
			fieldgoalpercentage: fieldgoalpercentage,
			freethrowpercentage: freethrowpercentage,
			points: points,
			steals: steals,
			turnovers: turnovers,
			totalrebounds: totalrebounds
		};
	}


	/**
	returns a score which is the sum of adding each
    field in s1 and s2 together
    */
	static add(s1, s2) {
		return new Score(
			s1.score_map.threepointersmade + s2.score_map.threepointersmade,
			s1.score_map.assists + s2.score_map.assists,
			s1.score_map.blocks + s2.score_map.blocks,
			s1.score_map.fieldgoalpercentage + s2.score_map.fieldgoalpercentage,
			s1.score_map.freethrowpercentage + s2.score_map.freethrowpercentage,
			s1.score_map.points + s2.score_map.points,
			s1.score_map.steals + s2.score_map.steals,
			s1.score_map.turnovers + s2.score_map.turnovers,
			s1.score_map.totalrebounds + s2.score_map.totalrebounds
			);
	}

	/**
	returns 1 when s1 has a higher value in more
    fields than s2, -1 otherwise
    */
	static comp(s1, s2) {
		var res = 0;
		for (var key in s1) {
			if (s1.hasOwnProperty(key)) {
				if (s1[key] > s2[key]) {
					res += 1;
				}
				if (s1[key] < s2[key]) {
					res -= 1;
				}
			}
		}
		return res;
	}

	static blank_score() {
		return new Score(0, 0, 0, 0, 0, 0, 0, 0, 0);
	}
}

var prediction = "prediction";
var assigned = "assigned";
// TODO: set prediction level to be integer that way we can blow it away up to a point

class Draft {
	constructor(level, team_identifier) {
		this.level = level;
		this.team_identifier = team_identifier;
		this.drafted_at = new Date().getTime();
	}

	is_prediction() {
		return this.level != assigned;
	}
}

class Player {
	constructor(identifier, games_expected_to_play, score) {
		this.identifier = identifier;
		this.games_expected_to_play = games_expected_to_play;
		this.score = score;
	}

	can_draft() {
		return this.draft !== null;
	}

	draft(level, team_identifier) {
		if (this.can_draft() == false) {
			throw "player already drafted: " + this.identifier;
		}
		this.draft = new Draft(level, team_identifier);
	}

	reset_prediction_draft() {
		if (this.draft.is_prediction()) {
			this.draft = null;
		}
	}

	score(r) {
		if (r < 0 || 1 < r) {
			throw "invalid random number: " + r;
		}
		if (r <= (this.games_expected_to_play / games_in_season)) {
			return this.score;
		}
		return Score.blank_score();
	}
}

class PlayerPool {
	constructor(players) {
		this.players = {};
      //console.log(output);
			for (var i = 0; i < players.length; i++) {
        var p = players[i];
        //console.log(p);
				this.players[p.id] = new Player(
					p.id,
					p.games,
					//totalrebounds, assists, totalrebounds, totalrebounds, points, steals, totalrebounds, totalRebounds, blocks
					new Score(
            p.threepointersmade,
            p.assists,
            p.blocks,
            p.fieldgoalpercentage,
            p.freethrowpercentage,
            p.points,
            p.steals,
            p.turnovers,
            p.totalrebounds
          )
				);
			}
	}

	add_player(player) {
		this.players[player.identifier] = player;
	}

	get_player(player_identifier) {
		return this.players[player_identifier];
	}

	reset_prediction_drafts_for_pool() {
		for (var player in this.players) {
			this.players[player].reset_prediction_draft();
		}
	}
}

class Team {
	constructor(identifier, draft_pick) {
		this.identifier = identifier;
		this.draft_pick = draft_pick;
		this.players = {};
	}

	can_add_player() {
		return Object.keys(this.players).length < players_allowed_on_team;
	}

	// TODO: has own property for every for loop
	add_player(level, player) {
		if (player.identifier in this.players) {
			console.log( "identifier already used: " + player.identifier + " for team: " + this.identifier );
		}
		if (this.can_add_player() === false) {
			throw "max number of players has alredy been met for team: " + this.identifier;
		}
		player.draft(level, this.identifier);
		this.players[player.identifier] = player;
	}

	reset_prediction_players() {
		for (var player in this.players) {
			delete this.players[player];
		}
	}

	score(r) {
		var res = Score.blank_score();
		for (var pid in this.players) {
			if (this.players.hasOwnProperty(pid)) {
				res = Score.add(res, this.players[pid].score(r));
			}
		}
    console.log(res);
		return res;
	}

	wins(other_teams, random_numbers) {
		var res = 0;
		for (var other_team in other_teams) {
			if (0 < Team.comp(this, other_team)) {
				res += 1;
			}
		}
		return res;
	}

	static comp(t1, t2, random_numbers) {
		res = 0;
		for (var r in random_numbers) {
			if (0 < Score.comp(t1.score(), t2.score())) {
				res += 1;
			} else {
				res -= 1;
			}
		}
		return res;
	}
}

var _order_teams = function(teams) {
	res = [];
	for (var k in teams) {
		res.push(teams[k]);
	}
	return res;
}

var _n_random_numbers = function(n) {
	res = [];
	for (var i = 0; i < n; i++) {
		res.push(Math.random());
	}
	return res;
}

class League {
	constructor(players) {
		this.teams = {};
    this.playerpool = new PlayerPool(players);
	}

	add_team(team) {
		this.teams[team.identifier] = team;
	}

  // I had to change this because it was causing errors. I don't really know what it does. . .
  //__level=assigned
	add_player_to_team(player_identifier, team_identifier, __level) {
		this.teams[team_identifier].add_player(
			__level,
			this.player_pool.get_player(player_identifier));
	}

	next_pick_for_team(team_identifier) {
		var other_teams = [];
		for (var tid in this.teams) {
			if (tid != team_identifier) {
				other_teams.push(this.teams[tid]);
			}
		}

		var top_wins = this.teams[team_identifier].wins(other_teams, _n_random_numbers(10));

		return pid;
	}

	all_teams_drafted() {
		for (var t in this.teams) {
			if (this.teams[t].can_add_player()) {
				return false;
			}
		}
		return true;
	}

	predict_draft_teams() {
		if (this.all_teams_drafted()) {
			return null;
		}

		ordered_teams = _order_teams(this.teams);

		for (var team_identifier in ordered_teams) {
			player_identifier = this.next_pick_for_team(team_identifier);
			this.add_player_to_team(player_identifier, team_identifier, prediction);
		}

		this.predict_draft_teams();
	}
}
