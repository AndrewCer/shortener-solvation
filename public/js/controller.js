String.prototype.capitalize = function(){
    return this.toLowerCase().replace( /\b\w/g, function (m) {
        return m.toUpperCase();
    });
};

var shortyUrl = function () {
  return 'shor.ty/' + (Math.random()*0xFFFFFF<<0);
}

app.controller('MasterController', ['$scope', '$location', '$cookies', '$http', function ($scope, $location, $cookies, $http) {
  var userCookie = $cookies.get('user');
  var checkUser = function () {
    $http.post('api/check-user', {userId: userCookie})
    .then(function (response) {
      if (response.data) {
        $scope.userInfo = response.data;
        $scope.userName = response.data.userName.capitalize();
      }
    })
  }
  if (userCookie != undefined) {
    $scope.showDefaultBar = false;
    $scope.showUserBar = true;
    checkUser();
  }
  else {
    $scope.showDefaultBar = true;
    $scope.showUserBar = false;
  }
  $scope.getUserPage = function () {
    $location.path('/user-page/' + $scope.userInfo.userId);
  }
  $scope.logout = function () {
    $cookies.remove('user');
    $location.path('/');
    $scope.showDefaultBar = true;
    $scope.showUserBar = false;
  }
  $scope.backHome = function () {
    $location.path('/');
  }
}]);

app.controller('UserController', ['$scope', '$location', '$routeParams', '$http', '$route', function ($scope, $location, $routeParams, $http) {
  var getUserBookmarks = function () {
    //if user id exists in cook do this else remove all cookies and redirect to home page
    var userId = $routeParams.id;
    $http.post('api/all-user-bookmarks', {userId: userId})
    .then(function (response) {
      $scope.bookmarks = response.data.reverse();
    })
  }
  getUserBookmarks();

  var checkUrl = function (longUrl) {
    if (longUrl === undefined) {
      $scope.inputLengthError = true;
      $scope.badInput = longUrl;
      return false;
    }
    if (longUrl === 'http:' || longUrl === 'https:' || longUrl === 'http://' || longUrl === 'https://') {
      $scope.inputError = true;
      $scope.badInput = longUrl;
      return false;
    }
    var checkArray = longUrl.split('//');
    if (checkArray[0] === 'http:' || checkArray[0] === 'https:') {
      $scope.inputError = false;
      return true
    }
    else {
      $scope.inputError = true;
      $scope.badInput = longUrl;
      return false;
    }
  }

  $scope.shortenUserUrl = function () {
    var hexHolder = shortyUrl();
    if (checkUrl($scope.longUrl)) {
      $http.post('api/user-shortify', {longUrl: $scope.longUrl, shortyUrl: hexHolder, userId: $routeParams.id})
      .then(function (response) {
        if (response.data === true) {
          $scope.addBookmark = false;
          $scope.inputRedundError = false;
          $scope.badInput = null;
          $scope.newPost = true;
          $scope.postedLongUrl = $scope.longUrl;
          $scope.shortyUrl = hexHolder;
          $scope.longUrl = null;
          getUserBookmarks();
        }
        else {
          $scope.inputRedundError = true;
          $scope.badInput = $scope.longUrl;
        }
      });
    }
    else {
      console.log('not passing');
    }
  }

  $scope.redirectUrl = function (clickedUrl) {
    $http.post('api/redirect', {shortyUrl: clickedUrl})
    .then(function (response) {
      getUserBookmarks();
    });
  }

  $scope.deleteClicked = function (bookmark, delIndex) {
    $scope.deletionIndex = delIndex;
    $scope.slottedDeletion = bookmark;
  }

  $scope.deleteBookmark = function () {
    var userId = $routeParams.id;
    $http.post('api/delete-user-bookmark', {bookmark: $scope.slottedDeletion, userId: userId})
    .then(function (response) {
      response.data ? getUserBookmarks() : console.log('delete broken');
    })
  }
}]);

app.controller('LoginController', ['$scope', '$location', '$http', '$cookies', '$window', function ($scope, $location, $http, $cookies, $window) {
  $scope.userLogin = function () {
    $http.post('api/login', {userName: $scope.userName, password: $scope.password})
    .then(function (response) {
      if (response.data) {
        $cookies.put('user', response.data);
        $window.location = '/user-page/' + response.data;
        // $location.path('/user-page/' + response.data);
      }
      else {
        $scope.loginError = 'Incorrect user name or password'
      }
    })
  }
}]);

app.controller('SignupController', ['$scope', '$location', '$http', '$cookies', '$window', function ($scope, $location, $http, $cookies, $window) {
  $scope.userSignup = function () {
    var errorArray = authentication($scope.userName, $scope.password, $scope.passwordConfirm);
    if (errorArray.length != 0) {
      $scope.signupErrors = errorArray;
    }
    else {
      $scope.signupErrors = null;
      $http.post('api/signup', {userName: $scope.userName, password: $scope.password})
      .then(function (response) {
        if (response.data === "user exists") {
          $scope.userExists = 'That user name is taken';
        }
        else {
          if (response.data) {
            $scope.userExists = null;
            $cookies.put('user', response.data);
            $window.location = '/user-page/' + response.data;
            // $location.path('/user-page/' + response.data);
          }
        }
      });
    }
  }
}]);

app.controller('HomeController', ['$scope', '$http', '$window', '$route', function ($scope, $http, $window, $route) {
  $scope.urlClicks = 0;

  var getBookmarks = function () {
    $http.get('api/all-bookmarks')
    .then(function (response) {
      $scope.bookmarks = response.data.reverse();
    });
  }

  getBookmarks();

  var checkUrl = function (longUrl) {
    if (longUrl === undefined) {
      $scope.inputLengthError = true;
      $scope.badInput = longUrl;
      return false;
    }
    if (longUrl === 'http:' || longUrl === 'https:' || longUrl === 'http://' || longUrl === 'https://') {
      $scope.inputError = true;
      $scope.badInput = longUrl;
      return false;
    }
    var checkArray = longUrl.split('//');
    if (checkArray[0] === 'http:' || checkArray[0] === 'https:') {
      $scope.inputError = false;
      return true
    }
    else {
      $scope.inputError = true;
      $scope.badInput = longUrl;
      return false;
    }
  }

  $scope.shortenUrl = function () {
    var hexHolder = shortyUrl();
    if (checkUrl($scope.longUrl)) {
      $http.post('api/shortify', {longUrl: $scope.longUrl, shortyUrl: hexHolder})
      .then(function (response) {
        if (response.data === true) {
          $scope.inputRedundError = false;
          $scope.badInput = null;
          $scope.newPost = true;
          $scope.postedLongUrl = $scope.longUrl;
          $scope.shortyUrl = hexHolder;
          $scope.longUrl = null;
        }
        else {
          $scope.inputRedundError = true;
          $scope.badInput = $scope.longUrl;
        }
      });
    }
    else {
      console.log('not passing');
    }
  }

  $scope.deleteClicked = function (bookmark, delIndex) {
    $scope.deletionIndex = delIndex;
    $scope.slottedDeletion = bookmark;
  }

  $scope.deleteBookmark = function () {
    $http.post('api/delete-bookmark', {bookmark: $scope.slottedDeletion})
    .then(function (response) {
      response.data ? $scope.bookmarks.splice($scope.deletionIndex, 1) : console.log('delete broken');
    })
  }

  $scope.redirectUrl = function (clickedUrl) {
    $http.post('api/redirect', {shortyUrl: clickedUrl})
    .then(function (response) {
      getBookmarks();
    });
  }
}]);
