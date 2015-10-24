(function() {
  if (window.fantasyDraft == null) {
    window.fantasyDraft = {
      app: {}
    };
  }

  window.fantasyDraft.app.fantasyDraftNgServices = angular.module('fantasyDraftNg.services', []);

  window.fantasyDraft.app.fantasyDraftNgDirectives = angular.module('fantasyDraftNg.directives', []);

  window.fantasyDraft.app.fantasyDraftNgFilters = angular.module('fantasyDraftNg.filters', []);

  window.fantasyDraft.app.fantasyDraftNgConstants = angular.module('fantasyDraftNg.constants', []);

  window.fantasyDraft.app.fantasyDraftNg = angular.module('fantasyDraftNg', ['fantasyDraftNg.services', 'fantasyDraftNg.directives', 'fantasyDraftNg.filters', 'fantasyDraftNg.constants']);

}).call(this);
