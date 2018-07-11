var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var userSchema = new Schema({
    username:String,
    password:String,
    match_no:{type:Number,min:0},
    rank:{type:Number,min:0},
    credit:Number
});
module.exports = userSchema;
