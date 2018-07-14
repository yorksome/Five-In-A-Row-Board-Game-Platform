var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var UserModel = require('../database/userModel');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');

router.post('/reset',urlencodedParser, function (req, res) {

  var input_username = req.body.re_username;
  var old_pwd = req.body.old_password;
  var new_pwd = req.body.new_password;

  var conditions = { username : input_username, password : old_pwd };
  var update = { $set : { password : new_pwd }};
  var options = { upsert : false };

  UserModel.findOneAndUpdate(conditions,update,options,function(error,result){
    if(error){
      console.log(error);
      res.send('Username or Password Incorrect');
    }else {
      if(result)
      {
        console.log('Reset Ok');
        res.redirect('/');
      }else{
        console.log('No user existed')
        res.send('Username or Password Incorrect');
      }
    }
  });

});

module.exports = router;
