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
        console.log(params);
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
      return managerService;
    }
  ]);
}).call(this);
