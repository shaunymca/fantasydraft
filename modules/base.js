games_in_season = 82; //https://en.m.wikipedia.org/wiki/National_Basketball_Association#Regular_season
players_allowed_on_team = 15;

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
			s1.threePointersMade + s2.threePointersMade,
			s1.assists + s2.assists,
			s1.fieldGoalPercentage + s2.fieldGoalPercentage,
			s1.freeThrowPercentage + s2.freeThrowPercentage,
			s1.points + s2.points,
			s1.steals + s2.steals,
			s1.turnOvers + s2.turnOvers,
			s1.totalRebounds + s2.totalRebounds
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

class Player {
	constructor(identifier, games_expected_to_play, score) {
		this.identifier = identifier;
		this.games_expected_to_play = games_expected_to_play;
		this.score = score;
		this.drafted_at = null;
	}

	can_draft() {
		return this.drafted_at !== null;
	}

	draft() {
		if (this.can_draft() == false) {
			throw "player already drafted: " + this.identifier;
		}
		this.drafted_at = new Date().getTime();
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

class Team {
	constructor(identifier, draft_pick) {
		this.identifier = identifier;
		this.draft_pick = draft_pick;
		this.players = {};
	}

	can_add_player() {
		return Object.keys(this.players).length < players_allowed_on_team;
	}

	add_player(player) {
		if (player.identifier in this.players) {
			throw "identifier already used: " + player.identifier " for team: " + this.identifier;
		}
		if (this.can_add_player() == false) {
			throw "max number of players has alredy been met for team: " + this.identifier;
		}
		player.draft();
		this.players[player.identifier] = player;
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

class League {
	constructor() {
		teams = {};
	}

	pick_player_for_team(team_identifier, )
}
