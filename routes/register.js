var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var UserModel = require('../database/userModel');
//var UserEntity = require('../database/userEntity');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');

router.post('/register',urlencodedParser, function (req, res) {

  var input_username = req.body.reg_username;
  var input_password = req.body.reg_password;

  var newUser = {
    username: input_username,
    password: input_password
  };

  UserModel.create(newUser,function(error){
    if(error){
    console.log(error);
    res.redirect('/reg.html');
    }else {
    console.log('save ok');
    res.redirect('/');
    }
  });

});

module.exports = router;
