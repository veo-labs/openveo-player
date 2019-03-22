'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplToggleIconButton component.
   *
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout The AngularJS $timeout service
   * @param {Object} $scope Component isolated scope
   * @param {Object} $q The AngularJS $q service
   * @param {Object} $window The AngularJS $window service
   * @param {Object} oplEventsFactory To help manipulate DOM events
   * @class OplToggleIconButtonController
   * @constructor
   */
  function OplToggleIconButtonController($element, $timeout, $scope, $q, $window, oplEventsFactory) {
    var ctrl = this;
    var bodyElement;
    var buttonElement;
    var activationTimer;
    var deactivationTimer;
    var deactivationAnimationRequested;
    var activated;

    $scope.on = false;
    $scope.onIcon = null;
    $scope.offIcon = null;
    $scope.label = null;

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
     * Calls the oplOnUpdate function with the actual state.
     */
    function callAction() {
      if (ctrl.oplOnUpdate) ctrl.oplOnUpdate({on: !$scope.on});
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
      bodyElement.off(oplEventsFactory.EVENTS.UP, handleUp);

      if (ctrl.oplOnIcon && ctrl.oplOffIcon) {
        requestAnimationFrame(function() {
          deactivationAnimationRequested = true;
          animateDeactivation();
        });
      }

      activated = false;
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

      activated = true;

      if (ctrl.oplOnIcon && ctrl.oplOffIcon) {
        requestAnimationFrame(function() {
          animateActivation();
        });
      }
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

    /**
     * Sets ARIA label depending on value.
     */
    function updateLabel() {
      $scope.label = $scope.on ? ctrl.oplOnLabel : ctrl.oplOffLabel;
    }

    Object.defineProperties(ctrl, {

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          bodyElement = angular.element($window.document.body);
          buttonElement = angular.element($element[0].querySelector('.opl-toggle-icon-button'));

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
          buttonElement.off('keydown focus blur ' + oplEventsFactory.EVENTS.DOWN);
          bodyElement.off(oplEventsFactory.EVENTS.UP, handleUp);
          if (activationTimer) $timeout.cancel(activationTimer);
          if (deactivationTimer) $timeout.cancel(deactivationTimer);
        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplOn] oplOn old and new value
       * @param {String} [changedProperties.oplOn.currentValue] oplOn new value
       * @param {Object} [changedProperties.oplOffLabel] oplOffLabel old and new value
       * @param {String} [changedProperties.oplOffLabel.currentValue] oplOffLabel new value
       * @param {Object} [changedProperties.oplOnLabel] oplOnLabel old and new value
       * @param {String} [changedProperties.oplOnLabel.currentValue] oplOnLabel new value
       * @param {Object} [changedProperties.oplOnIcon] oplOnIcon old and new value
       * @param {String} [changedProperties.oplOnIcon.currentValue] oplOnIcon new value
       * @param {Object} [changedProperties.oplOffIcon] oplOffIcon old and new value
       * @param {String} [changedProperties.oplOffIcon.currentValue] oplOffIcon new value
       */
      $onChanges: {
        value: function(changedProperties) {
          var newValue;

          if (changedProperties.oplOn && changedProperties.oplOn.currentValue) {
            newValue = changedProperties.oplOn.currentValue;
            $scope.on = (!newValue || newValue === 'undefined') ? false : JSON.parse(newValue);
            updateLabel();
          }

          if (changedProperties.oplOnIcon && changedProperties.oplOnIcon.currentValue) {
            newValue = changedProperties.oplOnIcon.currentValue;
            $scope.onIcon = (!newValue || newValue === 'undefined') ? null : newValue;
          }

          if (changedProperties.oplOffIcon && changedProperties.oplOffIcon.currentValue) {
            newValue = changedProperties.oplOffIcon.currentValue;
            $scope.offIcon = (!newValue || newValue === 'undefined') ? null : newValue;
          }

          if (changedProperties.oplOffLabel && changedProperties.oplOffLabel.currentValue ||
            changedProperties.oplOnLabel && changedProperties.oplOnLabel.currentValue
          ) {
            updateLabel();
          }
        }
      }
    });

  }

  app.controller('OplToggleIconButtonController', OplToggleIconButtonController);
  OplToggleIconButtonController.$inject = ['$element', '$timeout', '$scope', '$q', '$window', 'oplEventsFactory'];

})(angular.module('ov.player'));
