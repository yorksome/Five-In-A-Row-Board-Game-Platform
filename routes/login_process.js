var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var UserModel = require('../database/userModel');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/loginProcess',urlencodedParser, function (req, res) {

  var input_username = req.body.username;
  var input_password = req.body.password;

  UserModel.findOne({username:input_username,password:input_password},function(error,result){
       if (result==null) {
         console.log('false');
         res.send('<p>Username or Password Incorrect.</p>');
       }
       else {
        console.log('true');
        req.session.user = {username:input_username};
        console.log(req.session.user.username + ' logged in');
        res.redirect('/index');
       }
  })
});

module.exports = router;
