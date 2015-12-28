// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('feud', [
  'ionic',
  'ui.router',
  'feud.login',
  'feud.home',
  'feud.friends',
  'feud.game',
  'feud.query',
  'feud.services'
  ])

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

  });
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    console.log("stateChangeError:");
    console.log(arguments);
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      cache: 'false',
      url: '/login',
      templateUrl: './js/login/login.html',
      controller: 'LoginController'
    })
    .state('home', {
      url: '/home',
      templateUrl: './js/home/home.html',
      controller: 'HomeController'
    })
    .state('friends', {
      url: '/home',
      templateUrl: './js/friends/friends.html',
      controller: 'FriendsController'
    })
    .state('game', {
      url: '/game',
      templateUrl: './js/game/game.html',
      controller: 'GameController'
    })
    .state('query', {
      url: '/query',
      templateUrl: './js/query/query.html',
      controller: 'QueryController'
    })
    $urlRouterProvider.otherwise('/login')
})
