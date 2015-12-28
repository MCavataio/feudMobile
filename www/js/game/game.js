angular.module('feud.game', [])
  // john pappas styling guide
.controller('GameController', function($scope, $location, Socket, $timeout){
  $scope.scoreBoard = {};
  $scope.query = {};
  $scope.questions = {};
  $scope.data = {};
  $scope.showRound = false
  $scope.gameBoard;
  $scope.scoreBoard.opponentScore = 0;
  $scope.queryAnswer = {};
  $scope.lightningRound = false;
  var gameTimer = 30; 


  
  $scope.toLobby = function() {
    Socket.emit('leaveRoom')
    $location.path('/home')
  }
  var init = function() {
    Socket.emit('initGame', "hello")
  }
  /////////////////////////////////////////////////////
  ////////// Game Logic
  /////////////////////////////////////////////////////
  var startRound = function(query) {
    $scope.gameBoard = true;
    $scope.questions = parsedResponses(query);
    $scope.scoreBoard.round = 1;
    $scope.scoreBoard.total = 0;
    $scope.scoreBoard.roundScore = 0;
    gameInfo($scope.questions, 1);
    timer(gameTimer, nextRound);
  }

  var nextRound = function() {
    
    // $scope.scoreBoard.total = $scope.scoreBoard.total + roundScore || 0;
    Socket.emit('updateScore', $scope.scoreBoard.total);
    $scope.scoreBoard.roundScore = 0;
    if ($scope.scoreBoard.round < 3) {
      $scope.scoreBoard.round++
      console.log('in nextRound')
      gameInfo($scope.questions, $scope.scoreBoard.round)
      timer(gameTimer, nextRound)
    } else {
      $scope.lightningRound = true;
      $scope.gameBoard = false;
      lightningRound();
    }
  }
//////////////////////////////////////
//////////////// Lightning Round
/////////////////////////////////////
  var lightningRound = function() {
    if ($scope.scoreBoard.round <= 9) {
      $scope.showRound = true;
      $scope.scoreBoard.round++;
      if ($scope.scoreBoard.round !== 9) {
        gameInfo($scope.questions, $scope.scoreBoard.round, true)
        timer(5, lightningRound)
      } else {
        Socket.emit('updateScore', $scope.scoreBoard.total)
      }
    }
  }

  var gameInfo = function(query, number, lightningRound) {
    number = number - 1
    $scope.query.title = query[number].title;
    if (!lightningRound) {
      $scope.query.responses = query[number].responses;
      // $scope.guess = query[number].title + " ";
      $scope.queryAnswer = {};    
    } else {
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
    var foundIndex = Number($scope.query.responses.indexOf(response))
    foundIndex++
    $scope.scoreBoard.total += scoreValues[foundIndex]
    $scope.showRound = false;
  }

  $scope.makeGuess = function() {
    var guess = $scope.data.guess;
    var foundIndex = $scope.query.responses.indexOf(guess);
    var responses = $scope.query.responses;
    // if guess is correct
    if (foundIndex > -1) {
      updateBoard(foundIndex)
      $scope.data.guess = "";
    }
    else {
      var data = {responses: responses, guess: guess};
      Game.fuzzyCheck(data)
      .then(function(response) {
        var value = response.data.value;
        var index = response.data.index;
        if (value > .85) {
          updateBoard(index)
        }
      })
    } $scope.data.guess = "";
  }
////////////////////////////////////////////////
//////////////  Game Helpers
////////////////////////////////////////////////
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
     $scope.queryAnswer[index] = $scope.query.responses[index]
      // $scope.guess = $scope.query.title + " ";
      $scope.guess = "";
      // increment index to correct value in scoreValues
      index++;
      // figure out whether or not to keep one score or continue to add to total
      // initialize round score
      $scope.scoreBoard.roundScore += scoreValues[index];
      // add to total score
      $scope.scoreBoard.total += scoreValues[index];
  }

  var parsedResponses = function (data) {
    // refactor to have constant time look up for score values
    var questions = {}
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
////////////////////////////////////////
//////////// Socket
////////////////////////////////////////

  Socket.on('startRound', function(query) {
    startRound(query);
  })

  Socket.on('updateScore', function(data) {
    $scope.scoreBoard.opponentScore = data.score || 0
    })
  init()
})