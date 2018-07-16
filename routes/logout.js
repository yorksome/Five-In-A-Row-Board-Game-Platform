var express = require('express');
var router = express.Router();

router.get('/', function (req, res,next) {
  var user = req.session.user;
  if(user){
    delete req.session.user;
    console.log(user.username + ' logged out');
  }
  res.redirect('/');
  return;
});

module.exports = router; //exports router object
