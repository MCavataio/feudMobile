angular.module('feud.home', [])
.controller('HomeController', function($rootScope, $scope, UserService, $ionicActionSheet, $state, $ionicLoading, Socket){
  $scope.user = UserService.getUser();
  $scope.games = {};

  $scope.query = function() {
    $state.go('query');
  }
  $scope.$on('$ionicView.enter', function() {
    console.log('i was called')
    Socket.emit('updateHome', $rootScope.user)
  });
  Socket.on('updateHome', function(data) {
    $scope.games.live = data;
  })
  $scope.init = function() {
    $rootScope.user = $scope.user.name
    var user = {
      name: $scope.user.name
    }
    console.log('hello')
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
  $scope.newGame = function() {
    $state.go('newGame');
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