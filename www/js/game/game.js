angular.module('feud.game', [])
  // john pappas styling guide
.controller('GameController', function($rootScope, $scope, $state, $q, UserService, $ionicLoading, $location, Socket, $timeout){
  $scope.scoreBoard = {};
  $scope.query = {};
  $scope.questions = {};
  $scope.data = {};
  $scope.showRound = false;
  $scope.gameBoard;
  $scope.scoreBoard.opponentScore = 0;
  $scope.queryAnswer = {};
  $scope.lightningRound = false;
  $scope.yerr = {};
  var gameTimer = 20;

  console.log('hello');

  $scope.home = function() {
    $scope.resultBoard = false;
    $state.go('home');
  };
  
  function init() {
    console.log('i was called again')
    startRound($rootScope.dbQuestion.question);
  };
  var startRound = function(query) {
    $scope.gameBoard = true;
    console.log('in startRound');
    $scope.gameBoard = true;
    $scope.questions = parsedResponses(query, false);
    $scope.scoreBoard.round = 1;
    $scope.scoreBoard.total = 0;
    $scope.scoreBoard.roundScore = 0;
    console.log($scope.questions);
    gameInfo($scope.questions, 1);
    timer(gameTimer, revealAnswers);
  };

  var revealAnswers = function() {
    updateScore();
    $scope.gameBoard = false;
    gameInfo($scope.questions, $scope.scoreBoard.round, true);
    $scope.resultBoard = true;
  };

  var updateScore = function() {
    var score = {
      gameID: $rootScope.dbQuestion.game,
      userCol: $rootScope.dbQuestion.user,
      score: $scope.scoreBoard.roundScore
    };
    Socket.emit('updateScore', score);
  };
  var gameInfo = function(query, number, lightningRound) {
    number = number - 1;
    $scope.query.title = query[number].title;
    if (!lightningRound) {
      $scope.query.responses = query[number].responses;
      // $scope.guess = query[number].title + " ";
      $scope.queryAnswer = {};
    } else {
      var temp = query[number].responses.slice(0);
      $scope.query.responses = query[number].responses;
      $scope.query.choices = shuffle(temp);
    }
  };
  function shuffle(array) {
    var counter = array.length, temp, index;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
  }
  $scope.checkAnswer = function(response) {
    var foundIndex = Number($scope.query.responses.indexOf(response));
    foundIndex++;
    $scope.scoreBoard.total += scoreValues[foundIndex];
    $scope.showRound = false;
  };

  $scope.makeGuess = function() {
    var guess = $scope.data.guess;
    var foundIndex = $scope.query.responses.indexOf(guess);
    var responses = $scope.query.responses;
    // if guess is correct
    if (foundIndex > -1) {
      updateBoard(foundIndex);
      $scope.data.guess = "";
    }
    else {
      var data = {responses: responses, guess: guess};

      Socket.emit('fuzzyCheck', data);
      // Game.fuzzyCheck(data)
      // .then(function(response) {
      //   var value = response.data.value;
      //   var index = response.data.index;
      //   if (value > .85) {
      //     updateBoard(index)
      //   }
      // })
    } $scope.data.guess = "";
  };
  Socket.on('fuzzyCheck', function(greatest) {
    console.log(greatest);
    var value = greatest.value;
    var index = greatest.index;
    if (value > 0.85) {
      updateBoard(index);
    }
  });
  var scoreValues = {
      1: 500,
      2: 400,
      3: 300,
      4: 200,
      5: 100
  }
    var updateBoard = function(index, lightningRound) {
        var guess = $scope.guess;
        var responses = $scope.query.responses;
          // set the answer on view to correct response
       $scope.queryAnswer[index] = $scope.query.responses[index];
        // $scope.guess = $scope.query.title + " ";
        $scope.guess = "";
        // increment index to correct value in scoreValues
        index++;
        // figure out whether or not to keep one score or continue to add to total
        // initialize round score
        $scope.scoreBoard.roundScore += scoreValues[index];
        // add to total score
        $scope.scoreBoard.total += scoreValues[index];
    };
    var parsedResponses = function (data, isLightning) {
      // refactor to have constant time look up for score values
      var questions = {};
      if (!isLightning) {
        questions[0] = {
          title: data.title,
          responses: []
        };
        for(var i = 0; i < 5; i++) {
          var queryResponse = "response" + (i + 1);
          if (data[queryResponse]) {
          questions[0].responses.push(data[queryResponse])
          }
        }
      }
      if(isLightning) {
        _.each(data, function(query, qNum) {
          if(query) {
            questions[qNum] = {
              title: query.title,
              responses: []
          }
          for (var i = 0; i < 5; i++) {
            var queryResponse = "response" + (i + 1);
            if (query[queryResponse]) {
              questions[qNum].responses.push(query[queryResponse])
            }
          }
        }
      })
    }
    return questions
    }
    var timer = function (time, cb) {
      $scope.counter = time;
      $scope.onTimeout = function() {
        if($scope.counter !==0) {
          $scope.counter--;
          mytimeout = $timeout($scope.onTimeout, 1000);
        }if($scope.counter === 0) {
          stop()
          cb();
        }
      }
      var mytimeout = $timeout($scope.onTimeout, 1000);
      var stop = function() {
        $timeout.cancel(mytimeout);
      }
    }
    init()
 });