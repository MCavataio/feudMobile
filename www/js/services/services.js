angular.module('feud.services', [])
.factory('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
})

.factory('Socket', function ($rootScope, $window) {
  var address = 'https://gfeud.herokuapp.com'
  console.log('trying to connect to socket')
  var socket = io.connect(address, {
    'sync disconnect on unload': true });
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments; 
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
  };
  return {
    socket: socket
  }
})