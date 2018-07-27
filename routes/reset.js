var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('reset');
});

module.exports = router; //exports router object
