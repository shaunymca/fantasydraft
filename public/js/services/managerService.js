(function() {
  fantasyDraft.app.fantasyDraftNgServices.service('managerService', [
    "$http", function($http) {
      var managerService;
      managerService = {};
      managerService.leagues = function() {
        return $http.get('/league').success(function(result)
        {
          return result;
        }).error(function(result) {
          return result;
        });
      };
      managerService.addManager = function(params) {
        var url;
        url = '/addteam';
        return $http({
          method: "POST",
          url: url,
          data: $.param(params),
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }).success(function(result) {
          return result;
        });
      };
      managerService.addPlayertoPool = function(params) {
        var url;
        url = '/addPlayer';
        return $http({
          method: "POST",
          url: url,
          data: $.param(params),
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }).success(function(result) {
          return result;
        });
      };
      managerService.getPredictions = function() {
        return $http.get('/predictDraft').success(function(result)
        {
          console.log('success');
          return result;
        }).error(function(result) {
          console.log('error');
          return result;
        });
      };
      return managerService;
    }
  ]);
}).call(this);
