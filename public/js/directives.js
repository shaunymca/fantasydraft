'use strict';

/* Directives */

angular.module('fantasyDraftApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });
