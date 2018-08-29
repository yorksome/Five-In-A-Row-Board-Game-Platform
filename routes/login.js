var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  msg='';
  res.render('login',{message:msg});
});

module.exports = router; //exports router object
