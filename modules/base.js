var games_in_season = 82; //https://en.m.wikipedia.org/wiki/National_Basketball_Association#Regular_season
var players_allowed_on_team = 15;

var deep_copy = function(obj) {
	return JSON.parse(JSON.stringify(obj));
}

class Score {
	constructor(threePointersMade, assists, fieldGoalPercentage, freeThrowPercentage, points, steals, turnOvers, totalRebounds) {
		this.score_map = {
			threePointersMade: threePointersMade,
			assists: assists,
			fieldGoalPercentage: fieldGoalPercentage,
			freeThrowPercentage: freeThrowPercentage,
			points: points,
			steals: steals,
			turnOvers: turnOvers,
			totalRebounds: totalRebounds
		};
	}

	/**
	returns a score which is the sum of adding each
    field in s1 and s2 together
    */
	static add(s1, s2) {
		return new Score(
			s1.score_map.threePointersMade + s2.score_map.threePointersMade,
			s1.score_map.assists + s2.score_map.assists,
			s1.score_map.fieldGoalPercentage + s2.score_map.fieldGoalPercentage,
			s1.score_map.freeThrowPercentage + s2.score_map.freeThrowPercentage,
			s1.score_map.points + s2.score_map.points,
			s1.score_map.steals + s2.score_map.steals,
			s1.score_map.turnOvers + s2.score_map.turnOvers,
			s1.score_map.totalRebounds + s2.score_map.totalRebounds
			);
	}

	/**
	returns 1 when s1 has a higher value in more
    fields than s2, -1 otherwise
    */
	static comp(s1, s2) {
		res = 0;
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
		return new Score(0, 0, 0, 0, 0, 0, 0, 0);
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
		this.team_identifier = null;
	}

	can_draft() {
		return this.draft !== null;
	}

	draft(level, team_identifier) {
		if (this.can_draft() == false) {
			throw "player already drafted: " + this.identifier;
		}
		this.team_identifier = team_identifier;
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
	constructor() {
		this.players = {};
	}

	add_player(player) {
		this.players[player.identifier] = player;
	}

	get_player(player_identifier) {
		return this.players[player_identifier];
	}

	reset_prediction_drafts_for_pool() {
		for (var player in this.players) {
			this.players[player].reset_prediction_draft()
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

	add_player(level, player) {
		if (player.identifier in this.players) {
			throw "identifier already used: " + player.identifier " for team: " + this.identifier;
		}
		if (this.can_add_player() == false) {
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
		res = Score.blank_score();
		for (var pid in players) {
			if (players.hasOwnProperty(pid)) {
				res = Score.add(res, players[pid].score(r));
			}
		}
		return res;
	}

	wins(other_teams, random_numbers) {
		res = 0;
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
	constructor() {
		this.teams = {};
		this.player_pool = new PlayerPool();
	}

	add_team(team) {
		this.teams[team.identifier] = team;
	}

	add_player_to_team(player_identifier, team_identifier, __level=assigned) {
		this.teams[team_identifier].add_player(
			__level,
			this.player_pool.get_player(player_identifier));
	}

	next_pick_for_team(team_identifier) {
		other_teams = [];
		for (var tid in this.teams) {
			if (tid != team_identifier) {
				other_teams.push(this.teams[tid]);
			}
		}

		top_wins = this.teams[team_identifier].wins(other_teams, _n_random_numbers(10));


	}

	all_teams_drafted() {
		res = true;
		for (var t in this.teams) {
			if (this.teams[t].can_add_player()) {
				need_to_draft = false;
				break;
			}
		}
		return res;
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








