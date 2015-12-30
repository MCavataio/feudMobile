angular.module('feud.newGame', [])

.controller('NewGameController', function($scope, $rootScope, $state, $q, UserService, $ionicLoading, $location, Socket){
  $scope.data = {};
  $scope.init = function() {
    var user = UserService.getUser()
    $scope.data.user = user
  }
  $scope.random = function() {
    var user = $scope.data.user.name
    console.log(user, "+++++++")
    Socket.emit('playRandom', $scope.data.user.name)
  }
  Socket.on('playRandom', function(data) {
    $rootScope.dbQuestion = data
    console.log(data)
    $state.go('game');
  })
  $scope.home = function() {
    $state.go('home');
  }

})