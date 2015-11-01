var app = angular.module("shortenerSolvation", ['ngRoute']);


app.config(function ($routeProvider, $locationProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })
    .when('/signup', {
      templateUrl: 'partials/signup.html',
      controller: 'SignupController'
    })
    .when('/user-page/:id', {
      templateUrl: 'partials/user-page.html',
      controller: 'UserController'
    })
    $locationProvider.html5Mode(true);
    // .otherwise({redirectTo: '/'})
})
