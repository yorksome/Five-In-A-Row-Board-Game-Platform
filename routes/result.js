var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var MatchModel = require('../database/matchModel');
var UserModel = require('../database/userModel');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');



router.post('/result',urlencodedParser, function (req, res) {

  var user = req.session.user;
  var p1 = req.body.p1;
  var p1Rank = parseFloat(req.body.p1Rank);
  var p1Rep = parseInt(req.body.p1Rep);
  var n = parseInt(req.body.p1Quit); // p1 quit times
  var p1Status = parseInt(req.body.p1Status);
  var p1Win = req.body.p1Win;
  var p2 = req.body.p2;
  var p2Rank =  parseFloat(req.body.p2Rank);
  var p2Rep = parseInt(req.body.p2Rep);
  var p2Status = parseInt(req.body.p2Status);
  var p2Win =  req.body.p2Win;

  var nowDate = new Date();
  var year = nowDate.getFullYear();
  var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
  var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
  var date = year + "-" + month + "-" + day;
  var status,g_rank,g_rep;

  if(p1Status==1 && p2Status==1){
    status=1;
    g_rep=1;
    p1Rep = p1Rep + g_rep;
  }else if (p1Status==-1 && p2Status!=-1) {
    status= -1;
    g_rep= -(Math.pow(2,n));
    n = n+1;
    p1Rep = p1Rep + g_rep;
  }else if(p2Status==-1 && p1Status!=-1){
    status= -1;
    g_rep = 0;
  }else {
   status= 0;
   g_rep = 0;
  }

  if(p1Win=='victory' && p2Win=='defeat'){
    if(p1Rank>=p2Rank){
      let p1Rate = (1/(1+Math.pow(10,((p2Rank-p1Rank)/400)))).toFixed(2);
      let p2Rate = (1/(1+Math.pow(10,((p1Rank-p2Rank)/400)))).toFixed(2);
      console.log(p1Rate);
      console.log(p2Rate);
      g_rank = 30*(1-p1Rate);
      p1Rank = (p1Rank + g_rank).toFixed(2);
      p2Rank = (p2Rank - g_rank).toFixed(2);
    }else{
      let p1Rate = (1/(1+Math.pow(10,((p1Rank-p2Rank)/400)))).toFixed(2);
      let p2Rate = (1/(1+Math.pow(10,((p2Rank-p1Rank)/400)))).toFixed(2);
      console.log('p1: ' + p1Rate);
      console.log('p2: ' + p2Rate);
      g_rank = 30*(1-p1Rate);
      p1Rank = (p1Rank + g_rank).toFixed(2);
      p2Rank = (p2Rank - g_rank).toFixed(2);
    }
  }
  else if (p1Win=='defeat' && p2Win=='victory') {
    if(p1Rank>=p2Rank){
      let p1Rate = (1/(1+Math.pow(10,((p2Rank-p1Rank)/400)))).toFixed(2);
      let p2Rate = (1/(1+Math.pow(10,((p1Rank-p2Rank)/400)))).toFixed(2);
      console.log(p1Rate);
      console.log(p2Rate);
      g_rank = 30*(0-p1Rate);
      p1Rank = (p1Rank + g_rank).toFixed(2);
      p2Rank = (p2Rank - g_rank).toFixed(2);
    }else{
      let p1Rate = (1/(1+Math.pow(10,((p1Rank-p2Rank)/400)))).toFixed(2);
      let p2Rate = (1/(1+Math.pow(10,((p2Rank-p1Rank)/400)))).toFixed(2);
      console.log(p1Rate);
      console.log(p2Rate);
      g_rank = 30*(0-p1Rate);
      p1Rank = (p1Rank + g_rank).toFixed(2);
      p2Rank = (p2Rank - g_rank).toFixed(2);
    }
  }else {
      g_rank=0;
  }

  var newMatch = {
    p1: p1,
    p2: p2,
    date: date,
    status: status,
    rankGained: g_rank,
    creditGained: g_rep
  };

  var conditions = { username : p1};
  var update = { $set : { rank:p1Rank, credit:p1Rep, quit_no:n } , $inc : {match_no:1} };
  var options = { upsert : false };

  UserModel.findOneAndUpdate(conditions,update,options,function(error,result){
    if (error) {
      res.json({
        message:error
      });
    }else {
           if (result) {
                console.log('update user info successfully');
           }else {
             console.log('no user info updated');
           }
    }
  });

  MatchModel.create(newMatch,function(error){
    if(error){
      res.json({message:error});
    }else{
      console.log('saving match successfully');
      res.render('index',{user:user,message:'* Rank and Reputation Updated! Please Check Profile and Match History.'});
      console.log('redirecting to homepage');
    }
  });
});

module.exports = router;
