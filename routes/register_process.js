var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var UserModel = require('../database/userModel');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');

router.post('/registerProcess',urlencodedParser, function (req, res) {

  var input_username = req.body.reg_username;
  var input_password = req.body.reg_password;

  var newUser = {
    username: input_username,
    password: input_password
  };

  UserModel.findOne({username: input_username},function (err, data) {
             if(err){
                 res.send(err);
             }
             if(data){
                 res.send('<p>Account already exists</p>');
                 return;
             }

          UserModel.create(newUser,function(error){
            if(error){
               res.json({
                 message:error
               });
            }else {
            req.session.user={username : input_username};
            console.log('New user: '+ req.session.user.username);
            res.render('index',{user:req.session.user,message:'* You have logged in!'});
            console.log(req.session.user.username + ' logged in');
            }
        });
    });
});

module.exports = router;
