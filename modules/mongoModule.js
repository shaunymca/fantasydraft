var mongoose = require('mongoose'),
    Q = require('q');


exports.init = function() {
    var fantasySchema = mongoose.Schema({}, 
    { strict : false })
    var Player = mongoose.model('Player', fantasySchema);
}

exports.savePlayers = function (data) {
    var fantasySchema = mongoose.Schema({},
    { strict : false })
    var Player = mongoose.model('Player', fantasySchema);
    Player.create(data);
}

exports.getPlayers = function () {
    var fantasySchema = mongoose.Schema({},
    { strict : false })
    var Player = mongoose.model('Player', fantasySchema);
    promise = Player.find().lean().exec();
    return promise
}

exports.connect = function (){
    mongoose.connect('mongodb://localhost/fantasy');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    return db;
}
