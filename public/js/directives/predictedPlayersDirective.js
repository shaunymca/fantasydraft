(function() {
  fantasyDraft.app.fantasyDraftNgDirectives.directive('predictedPlayers', [
    function() {
      return {
        restrict: 'E',
        scope: { players: '=players' },
        templateUrl: 'public/js/partials/directive.predictedPlayersDirective.html',
        controller: [
          "$scope", function($scope) {
            
          }
        ]
      };
    }
  ]);
}).call(this);
