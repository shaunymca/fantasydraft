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
              $scope.leagues = result.players;
              return $scope.apply;
          });
          $scope.addManager = function() {
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
              return $scope.error = error;
            });
          };
          $scope.getPredictions = function() {
            console.log('getPredictions');
            managerService.getPredictions().success(function(result) {
              $scope.teams = result.teams;
              return $scope.apply;
            });
          };
        }]
      };
    }
  ]);

}).call(this);
