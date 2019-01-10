'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplVolume component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout The AngularJS $timeout service
   * @param {Object} $q The AngularJS $q service
   * @class OplVolumeController
   * @constructor
   */
  function OplVolumeController($scope, $element, $timeout, $q) {
    var ctrl = this;
    var ngModelCtrl = $element.controller('ngModel');
    var volumeElement;
    var sliderElement;
    var buttonElement;
    var sliderWrapperElement;
    var opening;
    var closing;
    var toggleTimer;
    var opened = false;

    $scope.level = 50;
    $scope.sliderValue = 0;

    /**
     * Animates the volume controller opening.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateOpening() {
      var deferred = $q.defer();

      // Start opening animation
      volumeElement.addClass('opl-over');

      // An animation is associated to the "opl-over" class, wait for it to finish
      var onTransitionEnd = function onTransitionEnd() {
        sliderWrapperElement.off('transitionend');
        deferred.resolve();
      };
      sliderWrapperElement.on('transitionend', onTransitionEnd);

      return deferred.promise;
    }

    /**
     * Animates the volume controller closing.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateClosing() {
      var deferred = $q.defer();

      // Start closing animation
      volumeElement.removeClass('opl-over');

      // An animation is associated to the "opl-over" class, wait for it to finish
      var onTransitionEnd = function onTransitionEnd() {
        sliderWrapperElement.off('transitionend');
        deferred.resolve();
      };
      sliderWrapperElement.on('transitionend', onTransitionEnd);

      return deferred.promise;
    }

    /**
     * Updates model with actual level.
     */
    function updateModel() {
      ngModelCtrl.$setViewValue(ctrl.muted ? 0 : $scope.level);
      ngModelCtrl.$validate();
    }

    /**
     * Sets volume level.
     *
     * @param {Number} value The value to apply to the volume between 0 and 100
     * @param {Boolean} muted true to mute, false to unmute
     */
    function setLevel(level, muted) {
      if (level === $scope.level && muted === ctrl.muted) return;

      $scope.level = Math.min(100, Math.max(0, level || 0));
      ctrl.muted = !$scope.level || muted || false;
      $scope.sliderValue = ctrl.muted ? 0 : $scope.level;

      updateModel();
    }

    /**
     * Handles focus event.
     *
     * Set a focus class to the volume HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      volumeElement.addClass('opl-volume-focus');
    }

    /**
     * Handles blur event.
     *
     * Remove the focus class from the volume HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      volumeElement.removeClass('opl-volume-focus');
    }

    /**
     * Handles over event.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleOver(event) {
      if (opening || closing) return;

      if (toggleTimer) {
        $timeout.cancel(toggleTimer);
        toggleTimer = null;
      }

      if (opened) return;

      opening = true;
      requestAnimationFrame(function() {
        animateOpening().then(function() {
          opening = false;
          opened = true;

          if (ctrl.oplOnOpen) ctrl.oplOnOpen();
        });
      });
    }

    /**
     * Handles out event.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleOut(event) {
      if (closing || opening || !opened) return;

      toggleTimer = $timeout(function() {
        if (!opened) return;
        closing = true;
        requestAnimationFrame(function() {
          animateClosing().then(function() {
            opened = false;
            closing = false;

            if (ctrl.oplOnClose) ctrl.oplOnClose();
          });
        });
      }, 100);
    }

    Object.defineProperties(ctrl, {

      /**
       * Indicate if volume is muted.
       *
       * @property muted
       * @type Boolean
       */
      muted: {
        value: false,
        writable: true
      },

      /**
       * Initializes controller and attributes.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          volumeElement = angular.element($element[0].querySelector('.opl-volume'));
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {

          // Wait for oplSlider and oplToggleIconButton components.
          // Templates for oplSlider and oplToggleIconButton components are stored in cache and will
          // be processed in next loop.
          $timeout(function() {
            sliderWrapperElement = angular.element($element[0].querySelector('.opl-volume > div'));
            sliderElement = angular.element($element[0].querySelector('.opl-slider'));
            buttonElement = angular.element($element[0].querySelector('.opl-toggle-icon-button'));

            volumeElement.on('mouseover pointerover', handleOver);
            volumeElement.on('mouseout pointerout', handleOut);
            sliderElement.on('focus', handleFocus);
            sliderElement.on('blur', handleBlur);
            buttonElement.on('focus', handleFocus);
            buttonElement.on('blur', handleBlur);
            sliderWrapperElement.on('transitionend', function(event) {
              if (event.target === sliderWrapperElement[0] && event.propertyName === 'width')
                sliderElement.controller('oplSlider').reset();
            });
          });

        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          volumeElement.off('mouseover pointerover mouseout pointerout');

          if (sliderElement) sliderElement.off('focus blur');
          if (buttonElement) buttonElement.off('focus blur');
          if (sliderWrapperElement) sliderWrapperElement.off('transitionend');
        }
      },

      /**
       * Mutes / Unmutes.
       *
       * @method toggleSound
       * @param {Boolean} muted true to mute, false to unmute
       */
      toggleSound: {
        value: function(muted) {
          setLevel($scope.level, muted);
        }
      },

      /**
       * Sets volume level.
       *
       * @method setLevel
       * @param {Number} level The volume level
       */
      setLevel: {
        value: function(level) {
          setLevel(level, false);
        }
      }

    });

    /**
     * Updates the slider value from model.
     *
     * It overrides AngularJS $render.
     */
    ngModelCtrl.$render = function() {
      setLevel(ngModelCtrl.$viewValue || 0);
    };

    /**
     * Tests if the model is empty.
     *
     * It overrides AngularJS $isEmpty. The model value can't be empty.
     *
     * @param {Number} value The model value
     * @return {Boolean} false as the model can't by empty
     */
    ngModelCtrl.$isEmpty = function(value) {
      return false;
    };

    /**
     * Handles sub components focus.
     */
    $scope.handleFocus = function() {
      if (ctrl.oplOnFocus) ctrl.oplOnFocus();
    };

  }

  app.controller('OplVolumeController', OplVolumeController);
  OplVolumeController.$inject = [
    '$scope',
    '$element',
    '$timeout',
    '$q'
  ];

})(angular.module('ov.player'));
