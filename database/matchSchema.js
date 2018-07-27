var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var matchSchema = new Schema({
    p1: {type:String,required:true},
    p2: {type:String,required:true},
    date: {type:String},
    status: {type:Number,required:true},
    rankGained: {type:Number,default:0.0},
    creditGained: {type:Number,default:0.0}
});

module.exports = matchSchema;
