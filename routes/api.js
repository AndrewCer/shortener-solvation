var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
// var db = require('monk')("localhost/shorty");
var bookmarks = db.get('bookmarks');
var users = db.get('users');
var bcrypt = require('bcrypt');

router.get('/all-bookmarks', function (req, res) {
  bookmarks.find({})
  .then(function (allBookmarks) {
    allBookmarks.forEach(function (val, i) {
      delete allBookmarks[i]._id;
    });
    res.json(allBookmarks);
  });
});

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
          bookmarks.insert({longUrl: longUrl, shortyUrl: shortyUrl, userName: "", clicks: 0})
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
    bookmark.clicks += 1;
    bookmarks.update({shortyUrl: shortyUrl}, {$set: {clicks: bookmark.clicks}})
    .then(function () {
      var bookmarkObj = {
        longUrl: bookmark.longUrl,
        clicks: bookmark.clicks
      };
      res.json(bookmarkObj);
    });
  });
});

module.exports = router;
