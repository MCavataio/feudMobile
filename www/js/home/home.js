angular.module('feud.home', [])
.controller('HomeController', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading, Socket){
  $scope.user = UserService.getUser();

  $scope.query = function() {
    $state.go('query');
  }
  $scope.test = function() {
    console.log('initializing test')
    var user = {
      name: $scope.user.name
    }
    Socket.emit('userInfo', user);
  }
  $scope.playRandom = function() {
    console.log('initlizing play')
    var user = {
      name: $scope.user.name
    }
    Socket.emit('playRandom', user);
  }
  Socket.on('userInfo', function(data) {
    console.log(data)
  })

  $scope.friends = function() {
    $state.go('friends');  
  }
  $scope.game = function() {
    $state.go('game');
  }

  $scope.showLogOutMenu = function() {
    var hideSheet = $ionicActionSheet.show({
      destructiveText: 'Logout',
      titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(index) {
        return true;
      },
      destructiveButtonClicked: function(){
        $ionicLoading.show({
          template: 'Logging out...'
        });

        // Facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('login');
        },
        function(fail){
          $ionicLoading.hide();
        });
      }
    });
  };
})