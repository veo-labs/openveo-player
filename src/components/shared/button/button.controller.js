'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplButton component.
   *
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout The AngularJS $timeout service
   * @param {Object} $scope Component isolated scope
   * @param {Object} $q The AngularJS $q service
   * @param {Object} $window The AngularJS $window service
   * @param {Object} oplEventsFactory Helper to manipulate the DOM events
   * @class OplButtonController
   * @constructor
   */
  function OplButtonController($element, $timeout, $scope, $q, $window, oplEventsFactory) {
    var ctrl = this;
    var buttonElement;
    var bodyElement;
    var activationTimer;
    var deactivationTimer;
    var deactivationAnimationRequested;
    var activated;

    /**
     * Focuses the button.
     */
    function focus() {
      buttonElement.addClass('opl-focus');
      if (ctrl.oplOnFocus) ctrl.oplOnFocus();
    }

    /**
     * Unfocuses the button.
     */
    function unfocus() {
      buttonElement.removeClass('opl-focus');
    }

    /**
     * Animates the deactivation of the button.
     *
     * Deactivation is performed only if activation animation is ended and activation is ended.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateDeactivation() {
      if (!deactivationAnimationRequested || activationTimer) return $q.when();
      var deferred = $q.defer();

      deactivationAnimationRequested = false;
      activated = false;
      buttonElement.removeClass('opl-activation');

      // Start deactivation animation
      buttonElement.addClass('opl-deactivation');

      // An animation is associated to the opl-deactivation class, wait for it to finish before removing the
      // deactivation class
      // Delay corresponds to the animation duration
      deactivationTimer = $timeout(function() {
        buttonElement.removeClass('opl-deactivation');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates the activation of the button.
     *
     * Activation animation can be performed only if not activated.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateActivation() {
      var deferred = $q.defer();

      // Remove any ongoing activation / deactivation animations
      buttonElement.removeClass('opl-deactivation');
      if (activationTimer) $timeout.cancel(activationTimer);
      if (deactivationTimer) $timeout.cancel(deactivationTimer);

      // Start activation animation
      buttonElement.addClass('opl-activation');

      // An animation is associated to the opl-activation class, wait for it to finish before running the deactivation
      // animation
      // Delay corresponds to the animation duration
      activationTimer = $timeout(function() {
        activationTimer = null;
        requestAnimationFrame(function() {
          animateDeactivation().then(function() {
            deferred.resolve();
          });
        });
      }, 225);

      return deferred.promise;
    }

    /**
     * Calls the oplOnUpdate function.
     */
    function callAction() {
      if (ctrl.oplOnUpdate) ctrl.oplOnUpdate();
    }

    /**
     * Handles keydown events.
     *
     * Toggle button captures the following keyboard keys:
     *  - ENTER to action the button
     *
     * Captured keys will prevent default browser actions.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      if ((event.key !== 'Enter' && event.keyCode !== 13)) return;

      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
      $scope.$apply(callAction);
    }

    /**
     * Handles release events.
     *
     * After releasing, button is actioned and is not longer active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleUp(event) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();

      bodyElement.off(oplEventsFactory.EVENTS.UP, handleUp);
      requestAnimationFrame(function() {
        deactivationAnimationRequested = true;
        animateDeactivation();
      });
      activated = false;
      ctrl.focus();
      callAction();
    }

    /**
     * Handles pressed events.
     *
     * Pressing the button makes it active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleDown(event) {
      if (activated) return;

      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();

      activated = true;
      requestAnimationFrame(function() {
        animateActivation();
      });
      bodyElement.on(oplEventsFactory.EVENTS.UP, handleUp);
    }

    /**
     * Handles focus event.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      focus();
    }

    /**
     * Handles blur event.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      unfocus();
    }

    Object.defineProperties(ctrl, {

      /**
       * Focuses the button.
       *
       * @method focus
       */
      focus: {
        value: function() {
          buttonElement[0].focus();
        }
      },

      /**
       * Indicates if button is focused or not.
       *
       * @method isFocused
       * @return {Boolean} true if focused, false otherwise
       */
      isFocused: {
        value: function() {
          return buttonElement.hasClass('opl-focus');
        }
      },

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          bodyElement = angular.element($window.document.body);
          buttonElement = angular.element($element[0].querySelector('.opl-button'));

          buttonElement.on('keydown', handleKeyDown);
          buttonElement.on('focus', handleFocus);
          buttonElement.on('blur', handleBlur);
          buttonElement.on(oplEventsFactory.EVENTS.DOWN, handleDown);
        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          buttonElement.off(
            oplEventsFactory.EVENTS.DOWN + ' keydown focus blur'
          );
          bodyElement.off(oplEventsFactory.EVENTS.UP, handleUp);
          if (activationTimer) $timeout.cancel(activationTimer);
          if (deactivationTimer) $timeout.cancel(deactivationTimer);
        }
      }
    });

  }

  app.controller('OplButtonController', OplButtonController);
  OplButtonController.$inject = ['$element', '$timeout', '$scope', '$q', '$window', 'oplEventsFactory'];

})(angular.module('ov.player'));
