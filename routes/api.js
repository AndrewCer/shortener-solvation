var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
// var db = require('monk')("localhost/shorty");
var bookmarks = db.get('bookmarks');
var users = db.get('users');
var bcrypt = require('bcrypt');

var checkUrl = function (longUrl) {
  if (longUrl === undefined) {
    return false;
  }
  if (longUrl === 'http:' || longUrl === 'https:' || longUrl === 'http://' || longUrl === 'https://') {
    return false;
  }
  var checkArray = longUrl.split('//');
  if (checkArray[0] === 'http:' || checkArray[0] === 'https:') {
    return true
  }
  else {
    return false;
  }
}

var authentication = function (username, password) {
  var illegals = /\W/;
  var errorArray = [];
  //username
  if (username.length < 5 && username !=0) {
    errorArray.push('User Name must be longer than 4 characters')
  }
  if (username.length > 15) {
    errorArray.push('User Name must be less than 15 characters');
  }
  if (illegals.test(username)) {
    errorArray.push('User Name contains illegal characters. Can only use letters, numbers and underscores (no spaces)');
  }
  if (username === undefined || !username.replace(/\s/g, '').length) {
    errorArray.push('User Name can not be blank');
  }
  //password
  if (password === undefined || !password.replace(/\s/g, '').length) {
    errorArray.push('Password can not be blank');
  }
  if (password.length < 6 && password != 0) {
    errorArray.push('Password must be greater than 5 characters');
  }
  if (password.length >= 31) {
    errorArray.push('Password may not be more than 30 characters');
  }
  return errorArray;
}


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
  if (checkUrl(longUrl)) {
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
  }
  else {
    res.json(false);
  }
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
  var userName = req.body.userName.toLowerCase();
  var password = req.body.password;
  var errorArray = authentication(userName, password);
  if (errorArray.length != 0) {
    res.json(false)
  }
  else {
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
  }
});

router.post('/login', function (req, res) {
  var userName = req.body.userName.toLowerCase();
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
