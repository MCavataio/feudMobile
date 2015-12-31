angular.module('feud.newGame', [])

.controller('NewGameController', function($scope, $rootScope, $state, $q, UserService, $ionicLoading, $location, Socket){
  $scope.data = {};
  $scope.init = function() {
    var user = UserService.getUser()
    $scope.data.user = user
  }
  $scope.random = function() {
    console.log($scope.data.user, 'in random')
    var user =  {
      name: $scope.data.user.name,
      id: $scope.data.user.userID
    };
    console.log(user, "+++++++")
    Socket.emit('playRandom', user)
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