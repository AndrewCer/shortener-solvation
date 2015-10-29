app.controller('MasterController', ['$scope', function ($scope) {
}]);

app.controller('HomeController', ['$scope', '$http', function ($scope, $http) {
  var shortyUrl = function () {
    return 'shor.ty/' + (Math.random()*0xFFFFFF<<0).toString(16);
  }
  $scope.shortenUrl = function () {
    var hexHolder = shortyUrl();
    $http.post('api/shortify', {longUrl: $scope.longUrl, shortUrl: hexHolder})
    .then(function (response) {
      if (response.data === true) {
        $scope.postedLongUrl = $scope.longUrl;
        $scope.shortyUrl = hexHolder;
      }
    });
  }
}]);
