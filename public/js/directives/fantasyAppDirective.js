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
              $scope.leagues = result;
              console.log(result);
              return $scope.apply;
          });
        }]
      };
    }
  ]);

}).call(this);
