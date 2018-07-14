var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/index', function (req, res) {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router; //exports router object
