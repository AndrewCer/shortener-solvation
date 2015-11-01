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
    bookmarks.findOne({longUrl: longUrl})
    .then(function (bookmark) {
      console.log(bookmark);
      if (bookmark) {
        res.json(false)
      }
      else {
          bookmarks.insert({longUrl: longUrl, shortyUrl: shortyUrl, userName: "", clicks: 0})
          .then(function () {
            res.json(true);
          });
      }
    })
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

router.post('/delete-bookmark', function (req, res) {
  var bookmark = req.body.bookmark;
  bookmarks.remove({longUrl: bookmark.longUrl})
  .then(function () {
    res.json(true);
  });
});

router.post('/signup', function (req, res) {
  // TODO: server side validation
  var userName = req.body.userName;
  var password = req.body.password;
  var hash = bcrypt.hashSync(password, 8);
  users.insert({userName: userName, password: hash, bookmarks: []})
  .then(function (user) {
    if (user) {
      res.json(user._id);
    }
    else {
      res.json(false);
    }
  })
});

module.exports = router;
