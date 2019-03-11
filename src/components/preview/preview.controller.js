'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplPreview component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $http AngularJS $http service
   * @class OplPreviewController
   * @constructor
   */
  function OplPreviewController($scope, $element, $http) {
    var ctrl = this;

    /**
     * Preloads the image.
     */
    function preloadImage() {
      if (!ctrl.oplUrl || ctrl.preloading || ctrl.preloaded) return;
      ctrl.preloading = true;

      $http.get(ctrl.oplUrl).then(function() {
        ctrl.preloading = false;
        ctrl.preloaded = true;
      }).catch(function() {
        ctrl.preloading = false;
        ctrl.preloaded = true;
        ctrl.error = true;
      });
    }

    Object.defineProperties(ctrl, {

      /**
       * Indicates if image is preloading or not.
       *
       * @property preloading
       * @type Boolean
       */
      preloading: {
        value: false,
        writable: true
      },

      /**
       * Indicates if image is preloaded or not.
       *
       * @property preloaded
       * @type Boolean
       */
      preloaded: {
        value: false,
        writable: true
      },

      /**
       * Image error message.
       *
       * @property error
       * @type String
       */
      error: {
        value: false,
        writable: true
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplUrl] oplUrl old and new value
       * @param {String} [changedProperties.oplUrl.currentValue] oplUrl new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if (changedProperties.oplUrl && changedProperties.oplUrl.currentValue) {
            ctrl.preloaded = false;
            ctrl.preloading = false;
            ctrl.error = false;
            preloadImage();
          }
        }
      }

    });

  }

  app.controller('OplPreviewController', OplPreviewController);
  OplPreviewController.$inject = ['$scope', '$element', '$http'];

})(angular.module('ov.player'));
