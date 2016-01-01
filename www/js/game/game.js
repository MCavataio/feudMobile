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
  var gameTimer = 5;
  var lightning = 5;


  $scope.$on('$ionicView.enter', function() {
    init()
  });

  $scope.home = function() {
    $scope.resultBoard = false;
    $state.go('home');
  };
  
  function init() {
    setScoreBoard(0,0,0)
    $scope.resultBoard = false;
    startRound($rootScope.dbQuestion);
    $scope.queryAnswer = {};
  };
  var startRound = function(query) {
    $scope.gameBoard = true;
    console.log(query);
    if (query.question.length === 2) {
      if (query.user === 'user2') {
        setScoreBoard(1, 0, 0)
        $scope.questions = parsedResponses(query.question, true)
        gameInfo($scope.questions, $scope.scoreBoard.round, "lightning");
        $rootScope.double = true;
        timer(gameTimer, revealAnswers)
      } else {
        console.log(' in else yeaaaaaa')
        setScoreBoard(2, 0, 0)
        $scope.questions = parsedResponses(query.question, true);
        gameInfo($scope.questions, $scope.scoreBoard.round, "lightning");
        $rootScope.double = true;
        timer(gameTimer, revealAnswers)
      }
    } else if(query.question.length === 5) {
      setScoreBoard(4, 0, 0)
      $scope.questions = parsedResponses(query.question, true);
      nextRound()
    }
     else {
      if ($rootScope.gameInformation) {
        if ($rootScope.gameInformation.round === 3) {
          setScoreBoard($rootScope.gameInformation.round, 0, 0)
        } 
      } else {
          setScoreBoard(1, 0, 0);
        }
      $scope.questions = parsedResponses(query.question, false);
      gameInfo($scope.questions, $scope.scoreBoard.round);
      $rootScope.double = false;
      timer(gameTimer, revealAnswers);
    }
  };
  var setScoreBoard = function(round, total, roundScore) {
    $scope.scoreBoard.round = round;
    $scope.scoreBoard.total = total;
    $scope.scoreBoard.roundScore = roundScore;
  }

  var revealAnswers = function() {
    $scope.gameBoard = false;
    gameInfo($scope.questions, $scope.scoreBoard.round, "reveal")
    $scope.resultBoard = true;
    if($rootScope.double) {
      timer(3, nextRound)
    } else {
      updateScore()
    }

  }

  var updateScore = function() {
    var score = {
      score: $scope.scoreBoard.roundScore,
      round: $scope.scoreBoard.round,
    }
    if ($rootScope.gameInformation) {
      console.log($rootScope.gameInformation.user, '++++++++++')
      if ($rootScope.gameInformation.user == 'user2' && score.round !== 2) {
        console.log($scope.scoreBoard.round, '-------------------')
        if ($scope.scoreBoard.round == 3) {
          console.log('setting round')
          score.round = 4;         
        }else if ($scope.scoreBoard.round == 8) {
          score.round = 5
        }
      } else 
        if ($scope.scoreBoard.round == 8) {
          score.round = 4
        }
      score.gameID = $rootScope.gameInformation.gameID,
      score.userCol = $rootScope.gameInformation.user,
      score.opponent = $rootScope.gameInformation.opponent
    } else {

        score.gameID   = $rootScope.dbQuestion.game,
        score.userCol  = $rootScope.dbQuestion.user,
        score.opponent = $rootScope.dbQuestion.opponent
      }
    console.log(score.round, "before being sent to socket")
    Socket.emit('updateScore', score)
    $rootScope.gameInformation = false;
  }

  var lightningRound = function() {
    if ($scope.scoreBoard.round <= 7) {
        $scope.showRound = true;
        $scope.scoreBoard.round++
        gameInfo($scope.questions, $scope.scoreBoard.round, true)
        timer(2, lightningRound)
      } else {
        $scope.showRound = false;
        updateScore()
      }
  }

  var nextRound = function() {
    
    // $scope.scoreBoard.total = $scope.scoreBoard.total + roundScore || 0;
    $scope.resultBoard = false;
    $scope.gameBoard = true;
    // Socket.emit('updateScore', $scope.scoreBoard.total);
    $scope.scoreBoard.roundScore = 0;
    if ($rootScope.double) {
      $rootScope.double = false;
      $scope.scoreBoard.round++
      gameInfo($scope.questions, $scope.scoreBoard.round, "lightning")
      timer(gameTimer, revealAnswers)
    }
    // if ($scope.scoreBoard.round < 3) {
    //   $scope.scoreBoard.round++
    //   console.log('in nextRound')
    //   gameInfo($scope.questions, $scope.scoreBoard.round)
    //   timer(gameTimer, nextRound)
    // } 
    else {
      console.log('in here')
      $scope.lightningRound = true;
      $scope.gameBoard = false;
      $scope.scoreBoard.round = 3;
      lightningRound();
    }
  }

  var gameInfo = function(query, number, round) {
    // number = number - 1
    $scope.query.title = query[number].title;
    if (round === "lightning") {
      $scope.query.responses = query[number].responses;
      // $scope.guess = query[number].title + " ";
      $scope.queryAnswer = {};    
    } 
    if (round === "reveal") {
      var temp = query[number].responses.slice(0)
      $scope.query.choices = temp;
    }  else {
      var temp = query[number].responses.slice(0)
      $scope.query.responses = query[number].responses
      $scope.query.choices = shuffle(temp)
    }
  }

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
    var questions = {}
    if (!isLightning) {
      questions[$scope.scoreBoard.round] = {
        title: data[0].title,
        responses: []
      }
      for (var i = 0; i < 5; i++) {
        var queryResponse = "response" + (i + 1);
        if (data[0][queryResponse]) {
        questions[$scope.scoreBoard.round].responses.push(data[0][queryResponse])    
        }
      }
    }
      // _.each(data, function(query, qNum) {
      //   if(query) {
      //     questions[qNum] = {
      //       title: query.title,
      //       responses: []
      //   }
    if(isLightning) {
      var round = $scope.scoreBoard.round
      var length = data.length + round;
      console.log(length,round, "|||||||||||||||||||||||||||||||||")
      var num = length - round - 1;
      for (var i = round; i < length; i++) {
        console.log(i, length, '++++++++')
        var query = data[num]
        if(query) {
          questions[i] = {
            title: query.title,
            responses: []
          }
        }
        for (var b = 0; b < 5; b++) {
          var queryResponse = "response" + (b + 1);
          if (query[queryResponse]) {
            questions[i].responses.push(query[queryResponse])
          }
        } 
        num--;
      }
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
 });