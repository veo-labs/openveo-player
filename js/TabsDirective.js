'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as HTML element ov-tabs to be able to manage a list of
   * views (ov-view elements) and switch between them using tabs.
   * ov-tabs element does not have any attributes.
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
      templateUrl: 'ov-player-tabs.html',
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
         * Adds the scope of an ovView directive to the list of tabs.
         *
         * @method addView
         * @param {Object} view The ovView to add to tabs
         */
        this.addView = function(view) {
          if (!$scope.views.length)
            $scope.select(view);

          $scope.views.push(view);
        };

        /**
         * Removes an ovView directive from the list of tabs.
         *
         * @method removeView
         * @param {Object} view The ovView to remove from tabs
         */
        this.removeView = function(view) {
          var index = $scope.views.indexOf(view);

          if (index !== -1)
            $scope.views.splice(index, 1);
        };

      }]
    };
  }

  app.directive('ovPlayerTabs', ovTabs);

})(angular.module('ov.player'));
