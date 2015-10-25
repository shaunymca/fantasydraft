
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

var init_league = function(teams, players) {
  var l = new League();
  for (var j = 0; j < teams.length; j++) {
    var db_t = teams[j];
    var t = new Team(db_t.id, db_t.name, db_t.draft_pick);
    l.add_team(t);
  }

  for (var i = 0; i < players.length; i++) {
    var db_p = players[i];
    var d;
    if (db_p.drafted_at) {
      d = new Draft(0, db_p.team_identifier, db_p.drafted_at);
    }

    var p = new Player(
      db_p.id,
      db_p.games,
      new Score(
        db_p.threepointersmade,
        db_p.assists,
        db_p.blocks,
        db_p.fieldgoalpercentage,
        db_p.freethrowpercentage,
        db_p.points,
        db_p.steals,
        db_p.turnovers,
        db_p.totalrebounds
      ),
      d
    );

    l.add_player(p);

    if (db_p.team_identifier) {
      l.add_player_to_team(db_p.id, db_p.team_identifier, 0);
    }
  }

  return l;
};

/**
 * Routes
 */
 // API SECTION
 app.get('/', function(req, res) {
   res.sendfile(__dirname + "/public/js/partials/index.html");
 });
 // LEAGUE SETTINGS:
 // Get the league object
 app.get('/league', function(req,res) {
   calculations.getPlayers().then(function(players) {
     populatedb.getTeams().then(function(teams){
       var l = init_league(teams, players);
       res.json(l.pretty_print());
     });
   });
 });
 // Add team to the league
 app.post('/addteam', function(req,res) {
   //console.log(req.body);
   populatedb.addTeam(req.body).then(function(output){
     res.json(output);
   });
   // this should add a team to the database and also to the League class. The req will include the team name, and anything else you need.
 });

 app.get('/nextpickforteam', function(req,res) {
   // this should get the next pick for the team passed to it from the req.
   // ex  - [team:12]
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
   // TODO this will remove a player from the POOL, but not the db. This will be used if I find out that a player is injured or something.
   // TODO I'll rerun the player pick stuff after this so no need to rerun that here.
 });

 app.get('/predictDraft', function(req, res) {
   calculations.getPlayers().then(function(players) {
     populatedb.getTeams().then(function(teams){
       try {
         var l = init_league(teams, players);
         l.predict_draft_teams(0);
         res.json(l.pretty_print());
       } catch (err) {
         console.log(err);
         res.status(500).send(err);
       }
     });
   });
 });

 app.get('/bower_components/*', function(req, res) {
   res.sendfile(__dirname + req.originalUrl);
 });

 app.get('/public/*', function(req, res) {
   res.sendfile(__dirname + req.originalUrl);
 });

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});


/*
pick_player_for_team(t, other_teams, unpicked_players, n_games):
  "picks the player which makes the number of teams
  that this team will beat the greatest"

  top_wins = compare_team_to_all_teams(t, other_teams, n_games)

  best_player = nil

  for (p in unpicked_players):
    other_teams_with_picks = pick_teams(conj(add_player(t, p), other_teams), dissoc(p, unpicked_players), n_games)
    w = compare_team_to_all_teams(add_player(t, p), other_teams_with_picks, n_games)
    if (top_wins < w):
      top_wins = w
      best_player = p

  return p

;; TODO: put draft round onto team object so that you know how to order teams for picking
pick_teams(current_teams, unpicked_players, n_games):
  if (teams-are-full):
    return current_teams
  if (teams-have-different-counts):
    throw some crazy fucking exception!

  teams = current_teams
  players = unpicked_players

  for (t in ordered_by_draft_pick(teams)):
    p = pick_player_for_team(t, dissoc(t, teams), players, n_games)
    add_player(t, p)
    drop(p, players)

  teams = pick_teams(teams, players, n_games)

  return teams
*/


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

class Draft {
	constructor(level, team_identifier, time) {
		this.level = level;
		this.team_identifier = team_identifier;
    var at = time;
    if (!at) {
      at = new Date();
    }
		this.drafted_at = at;
	}

	is_prediction(level) {
		return this.level > level;
	}
}

class Player {
	constructor(identifier, games_expected_to_play, score, draft) {
		this.identifier = identifier;
		this.games_expected_to_play = games_expected_to_play;
		this.score = score;
    this.draft = draft;
	}

  pretty_print() {
    var res = {
      player_id: this.identifier,
    };
    if (this.draft) {
      res.drafted_at = this.draft.drafted_at;
    }
    return res;
  }

	can_draft() {
		return this.draft === null || this.draft === undefined;
	}

	assign_to_team(level, team_identifier) {
		if (this.can_draft() === false) {
			throw "player already drafted: " + this.identifier;
		}
		this.draft = new Draft(level, team_identifier);
	}

	reset_prediction_draft(level) {
		if (this.draft.is_prediction(level)) {
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
	constructor() {
		this.players = {};
	}

  pretty_print() {
    var res = [];
    var self = this;
    Object.keys(this.players).forEach(function(p) {
      res.push(self.players[p].pretty_print());
    });
    return res;
  }

	add_player(player) {
		this.players[player.identifier] = player;
	}

	get_player(player_identifier) {
		return this.players[player_identifier];
	}

	reset_prediction_drafts_for_pool(level) {
		for (var player in this.players) {
			this.players[player].reset_prediction_draft(level);
		}
	}
}

class Team {
	constructor(identifier, name, draft_pick) {
		this.identifier = identifier;
    this.name = name;
		this.draft_pick = draft_pick;
		this.players = {};
	}

  pretty_print() {
    var res = {
      team_name: this.name,
      team_id: this.identifier,
      players: []
    };
    var self = this;
    Object.keys(this.players).forEach(function(p) {
      res.players.push(self.players[p].pretty_print());
    });
    return res;
  }

	can_add_player() {
		return Object.keys(this.players).length < players_allowed_on_team;
	}

	add_player(level, player) {
		if (player.identifier in this.players) {
			throw "identifier already used: " + player.identifier + " for team: " + this.identifier;
		}
		if (this.can_add_player() === false) {
			throw "max number of players has alredy been met for team: " + this.identifier;
		}
		player.assign_to_team(level, this.identifier);
		this.players[player.identifier] = player;
	}

	reset_prediction_players(level) {
		for (var pid in this.players) {
      if (this.players.hasOwnProperty(pid)) {
        var player = this.players[pid];
        if (player.is_prediction(level)) {
          delete this.players[player];
        }
      }
		}
	}

	score(r) {
		var res = Score.blank_score();
		for (var pid in this.players) {
			if (this.players.hasOwnProperty(pid)) {
				res = Score.add(res, this.players[pid].score(r));
			}
		}
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
		var res = 0;
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
	var res = [];
	for (var k in teams) {
		res.push(teams[k]);
	}
	return res;
};

var _n_random_numbers = function(n) {
	var res = [];
	for (var i = 0; i < n; i++) {
		res.push(Math.random());
	}
	return res;
};

class League {
	constructor() {
		this.teams = {};
    this.playerpool = new PlayerPool();
    this.__level = 1;
	}

  pretty_print() {
    var res = {
      teams: [],
      players: this.playerpool.pretty_print()
    };
    var self = this;
    Object.keys(this.teams).forEach(function(t) {
      res.teams.push(self.teams[t].pretty_print());
    });
    return res;
  }

	add_team(team) {
		this.teams[team.identifier] = team;
	}

  add_player(player) {
    this.playerpool.add_player(player);
  }

  // I had to change this because it was causing errors. I don't really know what it does. . .
  //__level=assigned
	add_player_to_team(player_identifier, team_identifier, level) {
		this.teams[team_identifier].add_player(
		  level,
			this.playerpool.get_player(player_identifier));
	}

	next_pick_for_team(team_identifier) {
    var self = this;
    var other_teams = [];

    Object.keys(this.teams).forEach(function(t) {
      if (t != team_identifier) {
				other_teams.push(self.teams[t]);
			}
    });

		var top_wins = this.teams[team_identifier].wins(other_teams, _n_random_numbers(10));

    var res_p;
    var player_ids = Object.keys(this.playerpool.players);
    for (var i = 0; i < player_ids.length; i++) {
      var player_id = player_ids[i];
      var player = this.playerpool.get_player(player_id);
      if (player.can_draft()) {
        res_p = player_id;
        break;
      }
    }

		return res_p;
	}

	all_teams_drafted() {
    var self = this;
    var team_ids = Object.keys(this.teams);
    for (var i = 0; i < team_ids.length; i ++) {
      var team_id = team_ids[i];
      if (self.teams[team_id].can_add_player()) {
				return false;
			}
    }
		return true;
	}

	predict_draft_teams(l) {
    var level = l;
    if (level === 0 || level === null || level === undefined) {
      level = 1;
    }
    console.log("predicting at level: " + level);

		if (this.all_teams_drafted()) {
			return null;
		}

    var team_ids = Object.keys(this.teams);
    for (var i = 0; i < team_ids.length; i++) {
      var team_id = team_ids[i];
      var player_identifier = this.next_pick_for_team(team_id);
      this.add_player_to_team(player_identifier, team_id, level);
    }

		return this.predict_draft_teams(level + 1);
	}
}
