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
              console.log("addManager ERROR");
            });
          };
          $scope.getPredictions = function() {
            console.log('getPredictions for draft: ' + $scope.draftid);
            managerService.getPredictions($scope.draftid).success(function(result) {
              $scope.teams = result.teams;
              console.log(result.teams);
              return $scope.apply;
            });
          };
          $scope.clearPredictions = function() {
            $scope.teams = null;
          };
          $scope.addDraftPick = function() {
              var params;
              console.log("saving!");
              $scope.error = null;
              params = {
                id: $scope.playerId,
                team_identifier: $scope.team_identifier
              };
            return managerService.addDraftPick(params).success(function(response) {
              console.log("SUCCESS");
            }).error(function(error) {
              console.log(" addDraftPick ERROR");
            });
          };
          $scope.addPlayertoPool = function() {
              var params;
              console.log("saving!");
              $scope.error = null;
              params = {
                player : $scope.playerName,
                g : $scope.games,
                position : $scope.position,
                threepointersmade: $scope.threepointersmade,
                assists: $scope.assists,
                blocks: $scope.blocks,
                fieldgoalpercentage: $scope.fieldgoalpercentage,
                freethrowpercentage: $scope.freethrowpercentage,
                points: $scope.points,
                steals: $scope.steals,
                turnovers: $scope.turnovers,
                totalrebounds: $scope.totalrebounds
              };
            return managerService.addPlayertoPool(params).success(function(response) {
              console.log("SUCCESS");
            }).error(function(error) {
              console.log(" addDraftPick ERROR");
            });
          };
        }]
      };
    }
  ]);

}).call(this);
