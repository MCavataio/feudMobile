angular.module('feud.query', [])

.controller('QueryController', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading, Socket) { 
  $scope.query = {};
  $scope.showResponses = false;

  $scope.home = function() {
    $state.go('home');
  }
  $scope.addPotential = function() {
    Socket.emit('addPotential', $scope.query);
  }

  $scope.viewQuery = function() {
    var query = {title: $scope.query.search};
    var suggestCallBack; // global var for autocomplete jsonp
    var request = {term: $scope.query.search};
    $scope.query.search = "";
    $.getJSON("https://suggestqueries.google.com/complete/search?callback=?",
      { 
        "hl":"en", // Language                  
        // "jsonp":"suggestCallBack", // jsonp callback function name
        "q":request.term, // query term
        "client":"youtube" // force youtube style response, i.e. jsonp
      })
      .then(function(data) {
        var responses = [];
        // create function for parsing
        for (var i = 0; i < data[1].length; i++ ){
          var split = data[1][i][0].split(query.title + " ")
          if (split.length > 1) {
            responses.push(split[1]);
            query["response" + (i + 1)] = split[1];
          } else {
            query['response' + (i + 1)] = split[0];
            responses.push(split[0]);
          }
        }
        
        $scope.$apply(function() {
          $scope.showResponses = true;
          $scope.query = query;
          $scope.query.return = responses.slice(0,5);
        });
      })
    }
  var updateResponses = function(data) {
    $scope.showResponses = true;
    $scope.query.return = data;
  }

    //   .then(function() {
    //     Home.addQuery(query)
    //       .then(function(query) {
    //         $scope.query.search = "";
    //         console.log("success")
    //       }).catch(function (error) {
    //         console.log("Error in submitting Query", error);
    //         $scope.query.search = "";
    //     })
    //   })
    // }
})