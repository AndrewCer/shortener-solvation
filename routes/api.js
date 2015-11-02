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

router.post('/all-user-bookmarks', function (req, res) {
  var userId = req.body.userId
  users.findOne({_id: userId})
  .then(function (user) {
    bookmarks.find({_id: {$in: user.bookmarks}})
    .then(function (userBookmarks) {
      res.json(userBookmarks)
    })
  })
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
          bookmarks.insert({longUrl: longUrl, shortyUrl: shortyUrl, clicks: 0})
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

router.post('/user-shortify', function (req, res) {
  var longUrl = req.body.longUrl;
  var shortyUrl = req.body.shortyUrl;
  var userId = req.body.userId;
  users.findOne({ _id: userId})
  .then(function (user) {
    if (!user) {
      console.log('no user found');
      res.json('no user');
    }
    else {
      bookmarks.findOne({longUrl: longUrl})
      .then(function (bookmark) {
        if (bookmark) {
          for (var i = 0; i < user.bookmarks.length; i++) {
            console.log(user.bookmarks[i], bookmark._id);
            if (user.bookmarks[i].toString() == bookmark._id.toString()) {
              res.json('bookmark exists');
            }
          }
          users.update({_id: userId}, {$push: {bookmarks: bookmark._id}})
          .then(function () {
            //success a bookmark was found and added to the users array
            res.json(true)
          })
        }
        else {
            bookmarks.insert({longUrl: longUrl, shortyUrl: shortyUrl, clicks: 0})
            .then(function (bookmark) {
              users.update({_id: userId}, {$push: {bookmarks: bookmark._id}})
              .then(function () {
                //success a bookmark was created and added to the users array
                res.json(true);
              })
            });
        }
      })

    }
  })
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

router.post('/delete-user-bookmark', function (req, res) {
  var bookmark = req.body.bookmark;
  var userId = req.body.userId
  bookmarks.findOne({longUrl: bookmark.longUrl})
  .then(function (bookmark) {
    users.update({_id: userId}, {$pull: {bookmarks: bookmark._id}})
    .then(function () {
      res.json(true);
    })
  });
});

router.post('/signup', function (req, res) {
  // TODO: server side validation
  var userName = req.body.userName;
  var password = req.body.password;
  var hash = bcrypt.hashSync(password, 8);
  users.findOne({userName: userName})
  .then(function (user) {
    if (user === null) {
      users.insert({userName: userName, password: hash, bookmarks: []})
      .then(function (user) {
        if (user) {
          res.json(user._id);
        }
        else {
          res.json(false);
        }
      })
    }
    else {
      res.json('user exists')
    }
  })

});

router.post('/login', function (req, res) {
  var userName = req.body.userName;
  var password = req.body.password;
  users.findOne({userName: userName})
  .then(function (user) {
    if (user === null) {
      res.json(false)
    }
    else {
      if (bcrypt.compareSync(password, user.password)) {
        res.json(user._id);
      }
      else {
        res.json(false);
      }
    }
  })
});

router.post('/check-user', function (req, res) {
  var userId = req.body.userId;
  users.findOne({_id: userId})
  .then(function (user) {
    if (user) {
      res.json({userId: user._id, userName: user.userName});
    }
    else {
      res.json(false);
    }
  });
});

module.exports = router;
