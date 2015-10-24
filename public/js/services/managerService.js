(function() {
  fantasyDraft.app.fantasyDraftNgServices.service('managerService', [
    "$http", function($http) {
      var managerService;
      managerService = {};
      managerService.getPlayers = function() {
        return $http.get('/players').success(function(result)
        {
          return result;
        }).error(function(result) {
          return result;
        });
      };
    }
  ]);
}).call(this);
