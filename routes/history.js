var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var MatchModel = require('../database/matchModel');

router.get('/', function (req, res,next) {
  var user = req.session.user;
  if(user){
      MatchModel.find({p1:user.username},function(error,result){
           if (result==null) {
             console.log('false');
             res.send("<p>No match history.</p><a href='/index'>Back</a>");
           }
           else {
             res.render('history',{user:user,data:result});
           }
    })
  }else{
    res.render('history',{user:user});
  }
});

module.exports = router; //exports router object
