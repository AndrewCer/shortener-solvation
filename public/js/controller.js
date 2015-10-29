app.controller('MasterController', ['$scope', '$location', function ($scope, $location) {
}]);

app.controller('LoginController', ['$scope', '$location', function ($scope, $location) {
}]);

app.controller('SignupController', ['$scope', '$location', function ($scope, $location) {
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
  // NOTE: this was taken out and refactored into a simple anchor tag to prevent popup blocking
  // $scope.redirectUrl = function (clickedUrl) {
  //   $http.post('api/redirect', {shortyUrl: clickedUrl})
  //   .then(function (response) {
  //     $scope.urlClicks = response.data.clicks;
  //     //if popups allowed
  //     $window.open(response.data.longUrl);
  //     $route.reload();
  //     //if not
  //     // $window.location.href = response.data;
  //   });
  // }
}]);
