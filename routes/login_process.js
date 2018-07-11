var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var UserModel = require('../database/userModel');
//var UserEntity = require('../database/userEntity');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/login', urlencodedParser, function (req, res) {

  var input_username = req.body.username;
  var input_password = req.body.password;

  UserModel.findOne({username:input_username,password:input_password},function(error,result){
       if (result==null) {
         console.log('false');
         res.sendFile(path.join(__dirname, '../public', 'login.html'));
       }
       else {
        console.log('true');
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
       }

  })
  //function getUser() {
//    var user;
  //  user = UserModel.findOne({ USERNAME: input_username })
//    .exec()
//    .then(function (result) {
//      return result;
//    })
//    .error(function (error) {
//      return 'Promise Error:' + error;
//    })
//    return user;
//  }

//  getUser()
//    .then(function(result){
//      if(result === null) {
//        res.redirect('/');
//      } else if (input_username === result.USERNAME && input_password === result.PASSWORD) {
//        console.log('true');
//        res.redirect('/index');
//      } else {
//        console.log('false');
//        res.redirect('/');
//      }
//    })
//    .error(function(error){
//      return 'Promise Error:' + error;
//    })
});

module.exports = router;
