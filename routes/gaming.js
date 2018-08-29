var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var UserModel = require('../database/userModel');

router.get('/', function (req, res) {
  var user = req.session.user;
  if(user){
    UserModel.findOne({username:user.username},function(error,result){
         if (result==null) {
           console.log('false');
           res.send('<p>No user existed.</p>');
         }
         else {
           res.render('gaming',{user:user,rank:result.rank,credit:result.credit,quit:result.quit_no});
         }
    })
  }
  else{
  res.render('gaming',{user:user});
  }
});

module.exports = router; //exports router object
