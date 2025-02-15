angular.module('MainApp').factory('LoginService', ['$http', 'WebServiceUrl', '$q', '$location', 'notifications', '$timeout',
    function ($http, WebServiceUrl, $q, $location, notifications, $timeout) {

      var LoginParams = {};

      var checkAuth = function(username){
          var getSdAuth = window.localStorage.getItem('sdAuth');
          LoginParams.approvalUrlHash = window.location.hash;
          LoginParams.username = username;

          if (getSdAuth == undefined) {             
              $location.url("/Login");
          }
          else{
              $http.post(WebServiceUrl + 'Authentication/checkAuthByUser', {pageindex: getSdAuth, Username: username}).success(function (data) {
                  if (data && data.errormsg) {
                      $location.url("/Login");

                      $timeout(function () {
                          if (data.errormsg == "Error: Username does not match.") {
                              notifications.showError("Username does not match the authentication key. Please login again to continue. ");
                          }
                          else if (data.errormsg == "Error: Authentication Key was not found.") {
                              notifications.showError("Authentication Key was not found. Please login again to continue.");
                          }
                          else {
                              notifications.showError(data.errormsg);
                          }

                      }, 100);
                  }                  
              }).error(function (data, status, headers, config) {
                  notifications.showError(data.ExceptionMessage);
                  $location.url("/Login");
              });
          }
      }

      return { LoginParams: LoginParams, checkAuth: checkAuth }

    }]);