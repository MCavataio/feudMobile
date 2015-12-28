angular.module('feud.friends', [])
  .controller("FriendsController", function($scope, UserService, $ionicActionSheet, $state, $ionicLoading, Socket) {
    $scope.user = {};
    console.log(' in friends controller with no html');
    $scope.init = function() {
        console.log(UserService.getUser())
        var user  = UserService.getUser();
        $scope.user = user
        console.log(user)
    }
    $scope.play = function(friend) {
        console.log(friend.name)
    }
    $scope.home = function() {
        $state.go('home');
    }
 
});