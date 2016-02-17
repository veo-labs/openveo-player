'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as HTML element ov-tabs to be able to manage a list of
   * views (ov-view elements) and switch between them using tabs.
   * ov-tabs element does not have any attributes.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * e.g.
   * <ov-tabs>
   *  <ov-view title="Tab 1 title">
   *    Content of the first view
   *  </ov-view>
   *  <ov-view title="Tab 2 title">
   *    Content of the second view
   *  </ov-view>
   * </ov-tabs>
   *
   * @module ov.player
   * @class ovTabs
   */
  function ovTabs() {
    return {
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/tabs.html',
      scope: {},
      transclude: true,
      controller: ['$scope', '$filter', function($scope, $filter) {
        $scope.views = [];

        /**
         * Selects a view.
         *
         * @param {Object} view The ovView to select
         */
        $scope.select = function(view) {
          angular.forEach($scope.views, function(view) {
            view.selected = false;
          });
          view.selected = true;
        };

        /**
         * Selects a tab.
         *
         * @method selectTabs
         * @param {String} viewId The id of the view to select
         */
        this.selectTabs = function(viewId) {
          var view = $filter('filter')($scope.views, {
            viewId: viewId
          },
          true);
          if (view.length != 0)
            $scope.select(view[0]);
        };

        /**
         * Add the scope of an ovView directive to the list of tabs.
         *
         * @method addView
         * @param {Object} view The ovView to add to tabs
         */
        this.addView = function(view) {
          if (!$scope.views.length)
            $scope.select(view);

          $scope.views.push(view);
        };

      }]
    };
  }

  app.directive('ovTabs', ovTabs);

})(angular.module('ov.player'));
