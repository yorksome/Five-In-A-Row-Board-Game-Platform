var mongoose = require('mongoose');
var MatchSchema = require('./matchSchema');

var Match = mongoose.model('matches',MatchSchema);
module.exports = Match;
