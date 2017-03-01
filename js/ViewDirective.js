'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as HTML element ov-view to be able to group HTML elements
   * which will be added to an ov-tabs element.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * Available attributes are :
   *  - String title The title that will be display in the tab
   *    corresponding to the view
   *  - String view A CSS class that will be added to the main container
   *    of the view
   *
   * e.g.
   * <ov-tabs>
   *  <ov-view title="Tab 1 title" view="view-1">
   *    Content of the first view
   *  </ov-view>
   *  <ov-view title="Tab 2 title" view="view-2">
   *    Content of the second view
   *  </ov-view>
   * </ov-tabs>
   *
   * @module ov.player
   * @class ovView
   */
  function ovView(ovViewLink) {
    return {
      restrict: 'E',
      require: '^ovPlayerTabs',
      transclude: true,
      templateUrl: ovPlayerDirectory + 'templates/view.html',
      scope: {
        title: '@',
        view: '@',
        viewId: '@'
      },
      link: ovViewLink
    };
  }

  app.factory('ovViewLink', function() {
    return function(scope, element, attrs, tabsController) {
      tabsController.addView(scope);
    };
  });

  app.directive('ovPlayerView', ovView);
  ovView.$inject = ['ovViewLink'];

})(angular.module('ov.player'));
