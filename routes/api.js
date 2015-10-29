var express = require('express');
var router = express.Router();

router.post('/shortify', function (req, res) {
  console.log(req.body);
  res.json(true);
});

module.exports = router;
