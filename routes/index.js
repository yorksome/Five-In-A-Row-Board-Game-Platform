var express = require('express');
var router = express.Router();

router.get('/', function (req, res,next) {
  var user = req.session.user;
  var message = '';
  res.render('index',{user:user,message:message});
});

module.exports = router; //exports router object
