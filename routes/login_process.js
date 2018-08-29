var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var UserModel = require('../database/userModel');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/loginProcess',urlencodedParser, function (req, res) {

  var input_username = req.body.username;
  var input_password = req.body.password;

  var session_user = req.session.user;
  if(input_username == session_user){
    res.send(input_username + 'has already logged in.');
  }

  UserModel.findOne({username:input_username,password:input_password},function(error,result){
       if (result==null) {
         console.log('false');
         res.render('login',{message:'* Invalid username and password.'});
       }
       else {
        console.log('true');
        req.session.user = {username:input_username};
        console.log(req.session.user.username + ' logged in');
        res.render('index',{user:req.session.user,message:'* Login Successfully!'});
       }
  })
});

module.exports = router;
