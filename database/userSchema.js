var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var userSchema = new Schema({
    username: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    match_no: {type:Number,default:0.0,min:0.0},
    quit_no: {type:Number,default:0.0,min:0.0},
    rank: {type:Number,default:1000},
    credit: {type:Number,default:0.0}
});

module.exports = userSchema;
