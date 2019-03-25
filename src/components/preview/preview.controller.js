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
    var preloadedImageUrls = [];
    $scope.url = null;
    $scope.position = {
      x: 0,
      y: 0
    };

    /**
     * Preloads the image.
     *
     * @param {String} url The image URL to preload
     */
    function preloadImage(url) {
      if (!url || ctrl.preloading || ctrl.preloaded) return;
      ctrl.preloading = true;

      $http.get(url).then(function() {
        ctrl.preloading = false;
        ctrl.preloaded = true;
        preloadedImageUrls.push(url);
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
       * @param {Object} [changedProperties.oplImage] oplImage old and new value
       * @param {String} [changedProperties.oplImage.currentValue] oplImage new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if (changedProperties.oplImage && changedProperties.oplImage.currentValue) {
            ctrl.error = false;

            if (preloadedImageUrls.indexOf(ctrl.oplImage.url || ctrl.oplImage) === -1) {
              ctrl.preloaded = false;
              ctrl.preloading = false;
              preloadImage(ctrl.oplImage.url || ctrl.oplImage);
            }

            $scope.url = ctrl.oplImage.url || ctrl.oplImage;
            $scope.position.x = ctrl.oplImage.x || 0;
            $scope.position.y = ctrl.oplImage.y || 0;
          }
        }
      }

    });

  }

  app.controller('OplPreviewController', OplPreviewController);
  OplPreviewController.$inject = ['$scope', '$element', '$http'];

})(angular.module('ov.player'));
