angular.module('feud.home', [])
.controller('HomeController', function($rootScope, $scope, UserService, $ionicActionSheet, $state, $ionicLoading, Socket){
  $scope.user = UserService.getUser();
  $scope.games = {};


  $scope.$on('$ionicView.enter', function() {
    $scope.user = UserService.getUser();
    console.log('called')
    Socket.emit('updateHome', $scope.user)
  });
  Socket.on('updateHome', function(data) {
    console.log('should have been called')
      $scope.games.yourTurn = data.yourTurn;
      $scope.games.opponentTurn = data.opponentTurn;
      $scope.games.finished = data.finished;
  })
  $scope.startGame = function(game) {
    var queries = [];
    var isUser1;
    if (game.user1 === game.turn) {
      var userCol = 'user1'
      isUser1 = true;
    } else {
      var userCol = 'user2'
      isUser1 = false;
    }
    $rootScope.gameInformation = {
      gameID: game.id,
      opponent: game.opponentName,
      id: game.opponentID,
      user: userCol,
      round: game.round
    }
    if (isUser1) {
      if (game.round == 2) {
        queries.push(game.questionRD3);
        queries.push(game.questionRD2);
      }
      if (game.round === 4) {
        queries = game.questionRD4.split("A");
      }
    } else {
      if (game.round === 1) {
        console.log('in here pushing two rounds lets go')
        $rootScope.gameInformation.friendly = true;
        queries.push(game.questionRD2);
        queries.push(game.questionRD1);
      }
      if (game.round === 3) {
        queries.push(game.questionRD3);
      }
      if (game.round === 4) {
        queries = game.questionRD4.split("A");
      }
    }
    Socket.emit('getQueries', queries);
  }
  Socket.on('getQueries', function(queries) {
    $rootScope.dbQuestion = {
      question: queries,
      user: $rootScope.user
    };
    $state.go('game');
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