angular.module('feud.friends', [])
  .controller("FriendsController", function($scope, UserService, $ionicActionSheet, $state, $ionicLoading, Socket) {
    $scope.user = {};
    console.log(' in friends controller with no html');
    $scope.init = function() {
        console.log(UserService.getUser())
        var user  = UserService.getUser();
        $scope.user = user
        console.log(user.friends, "++++++++++++++++++++++++++++++")
    }
    $scope.play = function(friend) {
        console.log(friend.name)
    }
    $scope.challenge = function(friend) {
        var gameInfo = {
            user2: friend.name,
            user2ID: friend.userID,
            user1: $scope.user.name,
            user1ID: $scope.user.userID
        }
        // Socket.emit('playFriend', gameInfo)
    }
    $scope.home = function() {
        $state.go('home');
    }
 
});