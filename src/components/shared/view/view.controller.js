'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplView component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The component HTML element
   * @class OplViewController
   * @constructor
   */
  function OplViewController($scope, $element) {
    var ctrl = this;
    var oplTabsCtrl = $element.controller('oplTabs');

    Object.defineProperties(ctrl, {

      /**
       * Indicates if view is selected or not.
       *
       * @property selected
       * @type Boolean
       */
      selected: {
        value: false,
        writable: true
      }

    });

    oplTabsCtrl.addView(ctrl);

    $scope.$watch('$ctrl.selected', function(newValue, oldValue) {
      if (newValue && ctrl.oplOnSelect) ctrl.oplOnSelect({id: ctrl.oplViewId});
    });

    // Detach view from tabs when view is destroyed
    $scope.$on('$destroy', function() {
      oplTabsCtrl.removeView(ctrl);
    });

  }

  app.controller('OplViewController', OplViewController);
  OplViewController.$inject = ['$scope', '$element'];

})(angular.module('ov.player'));
