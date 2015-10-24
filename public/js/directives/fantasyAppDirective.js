(function() {
  fantasyDraft.app.fantasyDraftNgDirectives.directive('fantasyDraftApp', [
    function() {
      return {
        restrict: 'E',
        scope: false,
        templateUrl: '/public/js/partials/directive.fantasyDraftDirective.html',
        controller: ["$scope", "managerService", function($scope, managerService) {
          managerService.getPlayers().success(function(result) {
            return $scope.players = result;
          });
        }]
      };
    }
  ]);

}).call(this);
