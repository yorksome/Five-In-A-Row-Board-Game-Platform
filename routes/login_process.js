var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var UserModel = require('../database/userModel');
//var UserEntity = require('../database/userEntity');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');

router.post('/loginProcess',urlencodedParser, function (req, res) {

  var input_username = req.body.username;
  var input_password = req.body.password;
  UserModel.findOne({username:input_username,password:input_password},function(error,result){
       if (result==null) {
         console.log('false');
         //req.session.user = null;
         res.redirect('/');
         //return res.json({success: false, message: 'Fail to login'});
       }
       else {
        console.log('true');
        req.session.user = input_username;
        console.log(req.session.user);
      //  res.json({success:true, message:'Login Successfully'});
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
       }
  })

});


module.exports = router;
