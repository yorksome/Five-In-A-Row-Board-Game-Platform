var mongoose = require('mongoose');
var UserSchema = require('./userSchema');

var User = mongoose.model('user',UserSchema);
module.exports = User;
