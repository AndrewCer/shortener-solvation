var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
// var db = require('monk')("localhost/shorty");
var bookmarks = db.get('bookmarks');
var users = db.get('users');
var bcrypt = require('bcrypt');

router.post('/shortify', function (req, res) {
  var longUrl = req.body.longUrl;
  var shortyUrl = req.body.shortyUrl
  // TODO: add server side validation
  //if (validation passes) {
    // TODO: check db for existing url
    // bookmarks.findOne({longUrl: longUrl})
    // .then(function (bookmark) {
    //   if (bookmark) {
    //     res.json("bookmark exists")
    //   }
    //   else {
          bookmarks.insert({longUrl: longUrl, shortyUrl: shortyUrl, userName: ""})
          .then(function () {
            res.json(true);
          });
    //   }
    // })
  //}
  // else {
  //   res.json(false);
  // }
});

router.post('/redirect', function (req, res) {
  var shortyUrl = req.body.shortyUrl;
  bookmarks.findOne({shortyUrl: shortyUrl})
  .then(function (bookmark) {
    res.json(bookmark.longUrl)
  });
});

module.exports = router;
