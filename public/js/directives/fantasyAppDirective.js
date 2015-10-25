(function() {
  fantasyDraft.app.fantasyDraftNgDirectives.directive('fantasyDraftApp', [
    function() {
      return {
        restrict: 'E',
        scope: true,
        templateUrl: '/public/js/partials/directive.fantasyDraftDirective.html',
        controller: [
          "$scope", "managerService", function($scope, managerService) {
          managerService.leagues().success(function(result) {
              console.log(result);
              $scope.leagues = result.players;
              return $scope.apply;
          });
          return $scope.addManager = function() {
              var params;
              console.log("saving!");
              $scope.error = null;
              params = {
                name: $scope.teamName,
                draft_pick: $scope.draft_pick
              };
            return managerService.addManager(params).success(function(league) {
              console.log("SUCCESS");
            }).error(function(error) {
              $scope.databaseCheck = null;
              return $scope.error = error;
            });
          };
        }]
      };
    }
  ]);

}).call(this);
