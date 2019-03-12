'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplVeoLabsButton component.
   *
   * @param {Object} $element The HTML element holding the component
   * @class OplVeoLabsButtonController
   * @constructor
   */
  function OplVeoLabsButtonController($element) {
    var ctrl = this;
    var buttonElement;
    var linkElement;

    /**
     * Handles focus event.
     *
     * Set a focus class to the HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      buttonElement.addClass('opl-focus');
      if (ctrl.oplOnFocus) ctrl.oplOnFocus();
    }

    /**
     * Handles blur event.
     *
     * Remove the focus class from the HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      buttonElement.removeClass('opl-focus');
    }

    /**
     * Sets event listeners on link element.
     */
    function setEventListeners() {
      linkElement.on('focus', handleFocus);
      linkElement.on('blur', handleBlur);
    }

    /**
     * Removes event listeners set with setEventListeners.
     */
    function clearEventListeners() {
      linkElement.off('focus', handleFocus);
      linkElement.off('blur', handleBlur);
    }

    Object.defineProperties(ctrl, {

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          buttonElement = angular.element($element[0].querySelector('.opl-veo-labs-button'));
          linkElement = angular.element($element[0].querySelector('a'));
          setEventListeners();
        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          clearEventListeners();
        }
      }

    });

  }

  app.controller('OplVeoLabsButtonController', OplVeoLabsButtonController);
  OplVeoLabsButtonController.$inject = ['$element'];

})(angular.module('ov.player'));
