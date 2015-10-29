app.controller('MasterController', ['$scope', function ($scope) {
}]);

app.controller('HomeController', ['$scope', '$http', '$window', function ($scope, $http, $window) {

  var shortyUrl = function () {
    return 'shor.ty/' + (Math.random()*0xFFFFFF<<0).toString(16);
  }

  var checkUrl = function (longUrl) {
    var checkArray = longUrl.split('//')
    if (checkArray[0] === 'http:' || checkArray[0] === 'https:') {
      console.log(checkArray);
    }
    else {
      $scope.inputError = true;
    }
  }

  $scope.shortenUrl = function () {
    var hexHolder = shortyUrl();
    // TODO: add client side validation
    //if validation passes
    checkUrl($scope.longUrl);
    // $http.post('api/shortify', {longUrl: $scope.longUrl, shortyUrl: hexHolder})
    // .then(function (response) {
    //   if (response.data === true) {
    //     $scope.postedLongUrl = $scope.longUrl;
    //     $scope.shortyUrl = hexHolder;
    //   }
    // });
  }

  $scope.redirectUrl = function (clickedUrl) {
    $http.post('api/redirect', {shortyUrl: clickedUrl})
    .then(function (response) {
      $window.open('http://www.google.com');
      // $window.location.href = response.data;
    });
  }
}]);
