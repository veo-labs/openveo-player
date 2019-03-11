'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplSlider component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $window The AngularJS $window service
   * @param {Object} $timeout The AngularJS $timeout service
   * @param {Object} $q The AngularJS $q service
   * @param {Object} oplDomFactory Helper to manipulate the DOM
   * @class OplSliderController
   * @constructor
   */
  function OplSliderController($scope, $element, $window, $timeout, $q, oplDomFactory) {
    var ctrl = this;
    var ngModelCtrl = $element.controller('ngModel');
    var step = 0;
    var sliderElementBoundingRectangle;
    var sliderElement;
    var thumbElement;
    var trackElement;
    var focusRingElement;
    var trackContainerElement;
    var bodyElement;
    var preventFocus;
    var inTransition;

    $scope.label = 'Select a value';
    $scope.valueText = '';
    $scope.valueTextParameters = null;
    $scope.value = 0;

    /**
     * Updates model with actual value.
     */
    function updateModel() {
      ngModelCtrl.$setViewValue($scope.value);
      ngModelCtrl.$validate();
    }

    /**
     * Updates the user interface with current value.
     *
     * Thumb and track are updated to reflect the slider value.
     */
    function updateUi() {
      if (!sliderElementBoundingRectangle) return;
      var percentage = $scope.value / 100;

      if (inTransition) {
        var onTransitionEnd = function onTransitionEnd() {
          sliderElement.removeClass('opl-slider-in-transition');
          thumbElement.off('transitionend');
        };
        thumbElement.on('transitionend', onTransitionEnd);
      }

      requestAnimationFrame(function() {
        trackElement.attr('style', 'transform: scaleX(' + percentage + ')');
        thumbElement.attr(
          'style',
          'transform: translateX(' + percentage * sliderElementBoundingRectangle.width + 'px) translateX(-50%)'
        );
      });
    }

    /**
     * Sets slider value.
     *
     * It also updates the model and the user interface.
     *
     * @param {Number} value The value to apply to the slider between 0 and 100
     */
    function setValue(value) {
      if (value === $scope.value) return;

      // If a step is defined, adjust value to be in a step
      value = Math.min(100, Math.max(0, value || 0));
      if (step) value = Math.round(value / step) * step;

      $scope.value = value;
      $scope.valueTextParameters = {
        '%value%': $scope.value
      };

      updateModel();
      updateUi();
    }

    /**
     * Gets the coordinates of an UIEvent.
     *
     * @param {UIEvent} event Either a MouseEvent, PointerEvent or TouchEvent
     * @return {Object} The coordinates with a property "x" and a property "y"
     */
    function getUiEventCoordinates(event) {
      var coordinates = {};

      if (event.targetTouches && event.targetTouches.length > 0) {

        // This is a TouchEvent with one or several touch targets
        // Get coordinates of the first touch point relative to the document edges
        coordinates.x = event.targetTouches[0].pageX;
        coordinates.y = event.targetTouches[0].pageY;

      } else {

        // This is a MouseEvent or a PointerEvent
        coordinates.x = event.pageX;
        coordinates.y = event.pageY;

      }

      return coordinates;
    }

    /**
     * Gets the slider value corresponding to an UI event.
     *
     * @param {UIEvent} event Either a MouseEvent, PointerEvent or TouchEvent
     * @return {Number} The slider value corresponding to the pressure from 0 to 100
     */
    function getValueFromUiEvent(event) {
      var coordinates = getUiEventCoordinates(event);

      var eventSliderXPosition = coordinates.x - sliderElementBoundingRectangle.left;
      return Math.max(0, Math.min(100, eventSliderXPosition / sliderElementBoundingRectangle.width * 100));
    }

    /**
     * Handles keydown events.
     *
     * Slider captures the following keyboard keys:
     *  - LEFT and BOTTOM keys to decrease by the step specified in the opl-step attribute
     *  - RIGHT and TOP keys to increase by the step specified in the opl-step attribute
     *  - BEGIN key to set slider value to 0
     *  - END key to set slider value to 100
     *
     * Captured keys will prevent default browser actions.
     * If key is supported the focus is placed on the slider element.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      var value = $scope.value;

      if ((event.key === 'ArrowLeft' || event.keyCode === 37) ||
          (event.key === 'ArrowDown' || event.keyCode === 40)
      ) {
        value = Math.max(0, value - (step || 1));
      } else if ((event.key === 'ArrowUp' || event.keyCode === 38) ||
          (event.key === 'ArrowRight' || event.keyCode === 39)
      ) {
        value = Math.min(100, value + (step || 1));
      } else if (event.key === 'Home' || event.keyCode === 36) {
        value = 0;
      } else if (event.key === 'End' || event.keyCode === 35) {
        value = 100;
      } else return;

      event.preventDefault();
      preventFocus = false;
      sliderElement[0].focus();
      setValue(value);
    }

    /**
     * Handles focus event.
     *
     * Set a focus class to the slider HTML element if not prevented.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      if (preventFocus) return;

      sliderElement.addClass('opl-slider-focus');
      if (ctrl.oplOnFocus) ctrl.oplOnFocus();
    }

    /**
     * Handles blur event.
     *
     * Remove the focus class from the slider HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      preventFocus = false;
      sliderElement.removeClass('opl-slider-focus');
    }

    /**
     * Handles resize event.
     *
     * When window is resized, the slider element may have been resized too.
     * Recalculate the position of the track and thumb elements.
     *
     * @param {Event} event The captured event
     */
    function handleResize(event) {
      ctrl.reset();
    }

    /**
     * Handles move events.
     *
     * While moving the value of the slider is updated.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleCursorMove(event) {
      event.preventDefault();
      setValue(getValueFromUiEvent(event));
    }

    /**
     * Handles release events.
     *
     * After releasing, the slider goes back to its resting state.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleUp(event) {
      bodyElement.off('mouseup pointerup touchend', handleUp);
      bodyElement.off('mousemove touchmove pointermove', handleCursorMove);
      sliderElement.removeClass('opl-slider-active');
    }

    /**
     * Handles pressed events.
     *
     * Pressing the slider will set the value to the pressed point and start the drag & drop if moving before
     * releasing the pressure.
     * Pressing makes the slider in active state.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleDown(event) {
      preventFocus = true;
      inTransition = true;
      sliderElement.addClass('opl-slider-active');
      sliderElement.addClass('opl-slider-in-transition');

      bodyElement.on('mouseup pointerup touchend', handleUp);
      bodyElement.on('mousemove touchmove pointermove', handleCursorMove);

      setValue(getValueFromUiEvent(event));
    }

    /**
     * Handles move events.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleMove(event) {
      if (!ctrl.oplOnMove) return;

      event.preventDefault();

      var coordinates = getUiEventCoordinates(event);
      ctrl.oplOnMove({
        value: getValueFromUiEvent(event),
        coordinates: coordinates,
        sliderBoundingRectangle: sliderElementBoundingRectangle
      });
    }

    /**
     * Handles over event.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleOver(event) {
      if (
        event.relatedTarget !== sliderElement[0] &&
        event.relatedTarget !== thumbElement[0] &&
        event.relatedTarget !== trackElement[0] &&
        event.relatedTarget !== focusRingElement[0] &&
        event.relatedTarget !== trackContainerElement[0] &&
        !sliderElement.hasClass('opl-over')
      ) {
        sliderElement.addClass('opl-over');
        if (ctrl.oplOnOver) ctrl.oplOnOver();
        bodyElement.off('mousemove touchmove pointermove', handleMove);
        bodyElement.on('mousemove touchmove pointermove', handleMove);
      }
    }

    /**
     * Handles out event.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleOut(event) {
      if (
        event.relatedTarget !== sliderElement[0] &&
        event.relatedTarget !== thumbElement[0] &&
        event.relatedTarget !== trackElement[0] &&
        event.relatedTarget !== focusRingElement[0] &&
        event.relatedTarget !== trackContainerElement[0] &&
        sliderElement.hasClass('opl-over')
      ) {
        sliderElement.removeClass('opl-over');
        if (ctrl.oplOnOut) ctrl.oplOnOut();
        bodyElement.off('mousemove touchmove pointermove', handleMove);
      }
    }

    /**
     * Sets event listeners on HTML elements of the scroller component.
     */
    function setEventListeners() {
      sliderElement.on('keydown', handleKeyDown);
      sliderElement.on('focus', handleFocus);
      sliderElement.on('blur', handleBlur);
      sliderElement.on('mousedown pointerdown touchstart', handleDown);
      sliderElement.on('mouseover pointerover', handleOver);
      sliderElement.on('mouseout pointerout', handleOut);

      angular.element($window).on('resize', handleResize);
    }

    /**
     * Removes event listeners set with setEventListeners.
     */
    function clearEventListeners() {
      sliderElement.off('keydown', handleKeyDown);
      sliderElement.off('focus', handleFocus);
      sliderElement.off('blur', handleBlur);
      sliderElement.off('mousedown pointerdown touchstart', handleDown);
      sliderElement.off('mouseout pointerout', handleOver);
      sliderElement.off('mouseout pointerout', handleOut);

      bodyElement.off('mouseup pointerup touchend', handleUp);
      bodyElement.off('mousemove touchmove pointermove', handleCursorMove);

      angular.element($window).off('resize', handleResize);
    }

    Object.defineProperties(ctrl, {

      /**
       * Initializes controller and attributes.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          bodyElement = angular.element($window.document.body);
          preventFocus = false;
          inTransition = false;
          sliderElement = angular.element($element[0].querySelector('.opl-slider'));
          thumbElement = angular.element($element[0].querySelector('.opl-slider-thumb-container'));
          trackElement = angular.element($element[0].querySelector('.opl-slider-track'));
          trackContainerElement = angular.element($element[0].querySelector('.opl-slider-track-container'));
          focusRingElement = angular.element($element[0].querySelector('.opl-slider-focus-ring'));

          ctrl.reset();
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
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplStep] oplStep old and new value
       * @param {String} [changedProperties.oplStep.currentValue] oplStep new value
       * @param {Object} [changedProperties.oplLabel] oplLabel old and new value
       * @param {String} [changedProperties.oplLabel.currentValue] oplLabel new value
       * @param {Object} [changedProperties.oplValueText] oplValueText old and new value
       * @param {String} [changedProperties.oplValueText.currentValue] oplValueText new value
       */
      $onChanges: {
        value: function(changedProperties) {
          var newValue;
          if (changedProperties.oplStep && changedProperties.oplStep.currentValue) {
            newValue = changedProperties.oplStep.currentValue;
            step = (!newValue || newValue === 'undefined') ? 0 : parseInt(newValue);
          }

          if (changedProperties.oplLabel && changedProperties.oplLabel.currentValue) {
            newValue = changedProperties.oplLabel.currentValue;
            $scope.label = (typeof newValue === 'undefined') ? 'Select a value' : newValue;
          }

          if (changedProperties.oplValueText && changedProperties.oplValueText.currentValue) {
            newValue = changedProperties.oplValueText.currentValue;
            $scope.valueText = (typeof newValue === 'undefined') ? '' : newValue;
          }
        }
      },

      /**
       * Forces the slider to reset.
       *
       * This is useful if the slider position has changed since its initialization.
       *
       * @method reset
       * @return {Promise} A promise resolving when reset has finished
       */
      reset: {
        value: function() {
          var deferred = $q.defer();
          clearEventListeners();
          setEventListeners();

          oplDomFactory.waitForElementDimension(sliderElement[0], [
            {
              property: 'width',
              notEqual: 0
            },
            {
              property: 'width',
              notEqual: (sliderElementBoundingRectangle) ? sliderElementBoundingRectangle.width : 0
            }
          ], 500).then(function(boundingRectangle) {
            sliderElementBoundingRectangle = boundingRectangle;
            updateUi();
            deferred.resolve();
          }).catch(function(reason) {
            sliderElementBoundingRectangle = sliderElement[0].getBoundingClientRect();

            // Slider size hasn't change
            updateUi();
            deferred.resolve();
          });

          return deferred.promise;
        }
      }
    });

    /**
     * Updates the slider value from model.
     *
     * It overrides AngularJS $render.
     */
    ngModelCtrl.$render = function() {
      ctrl.reset().then(function() {
        setValue(ngModelCtrl.$viewValue);
      });
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

  }

  app.controller('OplSliderController', OplSliderController);
  OplSliderController.$inject = [
    '$scope',
    '$element',
    '$window',
    '$timeout',
    '$q',
    'oplDomFactory'
  ];

})(angular.module('ov.player'));
