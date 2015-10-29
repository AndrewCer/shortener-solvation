app.controller('MasterController', ['$scope', function ($scope) {
}]);

app.controller('HomeController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
  var getBookmarks = function () {
    $http.get('api/all-bookmarks')
    .then(function (response) {
      $scope.bookmarks = response.data.reverse();
    });
  }
  getBookmarks();
  var shortyUrl = function () {
    return 'shor.ty/' + (Math.random()*0xFFFFFF<<0);
  }

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
          $scope.newPost = true;
          $scope.postedLongUrl = $scope.longUrl;
          $scope.shortyUrl = hexHolder;
        }
      });
    }
    else {
      console.log('not passing');
    }
  }
  $scope.urlClicks = 0;
  $scope.redirectUrl = function (clickedUrl) {
    $http.post('api/redirect', {shortyUrl: clickedUrl})
    .then(function (response) {
      $scope.urlClicks = response.data.clicks;
      //if popups allowed
      $window.open(response.data.longUrl);
      //if not
      // $window.location.href = response.data;
    });
  }
}]);
