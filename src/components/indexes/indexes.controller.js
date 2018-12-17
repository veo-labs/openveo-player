'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplIndexes component.
   *
   * @class OplIndexesController
   */
  function OplIndexesController() {
    var ctrl = this;

    Object.defineProperties(ctrl, {

      /**
       * The active index.
       *
       * @property activeIndex
       * @type Object
       */
      activeIndex: {
        value: null,
        writable: true
      },

      /**
       * Calls oplOnSeek with an index.
       *
       * @method goToIndex
       * @param {Object} index The index
       */
      goToIndex: {
        value: function(index) {
          if (ctrl.oplOnSeek) ctrl.oplOnSeek({index: index});
        }
      },

      /**
       * Displays the index large image.
       *
       * @method setActiveIndex
       * @param {Object} index The index to display
       */
      setActiveIndex: {
        value: function(index) {
          ctrl.activeIndex = index;
        }
      },

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          if (ctrl.oplIndexes.length) ctrl.setActiveIndex(ctrl.oplIndexes[0]);
        }
      }

    });

  }

  app.controller('OplIndexesController', OplIndexesController);
  OplIndexesController.$inject = [];

})(angular.module('ov.player'));
