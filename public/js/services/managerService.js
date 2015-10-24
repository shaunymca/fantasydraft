(function() {
  fantasyDraft.app.fantasyDraftNgServices.service('managerService', [
    "$http", function($http) {
      var managerService;
      managerService = {};
      managerService.leagues = function() {
        return $http.get('/league').success(function(result)
        {
          console.log(result);
          return result;
        }).error(function(result) {
          return result;
        });
      };
      return managerService;
    }
  ]);
}).call(this);
