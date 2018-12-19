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
   * @class OplSliderController
   * @constructor
   */
  function OplSliderController($scope, $element, $window) {
    var ctrl = this;
    var ngModelCtrl = $element.controller('ngModel');
    var step = 0;
    var sliderElementBoundingRectangle;
    var sliderElement;
    var thumbElement;
    var trackElement;
    var bodyElement;
    var preventFocus;
    var inTransition;

    /**
     * Updates model with actual value.
     */
    function updateModel() {
      ngModelCtrl.$setViewValue(ctrl.value);
      ngModelCtrl.$validate();
    }

    /**
     * Updates the user interface with current value.
     *
     * Thumb and track are updated to reflect the slider value.
     */
    function updateUI() {
      var percentage = ctrl.value / 100;

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
      if (value === ctrl.value) return;

      // If a step is defined, adjust value to be in a step
      if (step) value = Math.round(value / step) * step;

      ctrl.value = value;
      ctrl.valueTextParameters = {
        '%value%': ctrl.value
      };
      updateModel();
      updateUI();
    }

    /**
     * Computes the width of the slider HTML element.
     */
    function computeSliderElementBoundingRectangle() {
      sliderElementBoundingRectangle = sliderElement[0].getBoundingClientRect();
    }

    /**
     * Gets the slider value corresponding to a pressure event.
     *
     * @param {Event} pressureEvent Either a MouseEvent, PointerEvent or TouchEvent
     * @return {Number} The slider value corresponding to the pressure from 0 to 100
     */
    function getSliderPressureValue(pressureEvent) {
      var pressurePageXPosition;
      if (pressureEvent.targetTouches && pressureEvent.targetTouches.length > 0) {

        // This is a TouchEvent with one or several touch targets.
        // Get the x coordinate of the first touch point relative to the left
        // edge of the document
        pressurePageXPosition = pressureEvent.targetTouches[0].pageX;

      }

      // This is a MouseEvent or a PointerEvent
      pressurePageXPosition = pressureEvent.pageX;

      var pressureSliderXPosition = pressurePageXPosition - sliderElementBoundingRectangle.left;
      return Math.max(0, Math.min(100, pressureSliderXPosition / sliderElementBoundingRectangle.width * 100));
    }

    /**
     * Handles keywdown events.
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
      var value = ctrl.value;

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
      sliderElement.addClass('opl-slider-focus');
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
      computeSliderElementBoundingRectangle();
      updateUI();
    }

    /**
     * Handles release events.
     *
     * After releasing, the slider goes back to its resting state.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleUp(event) {
      bodyElement.off('mouseup pointerup touchend');
      bodyElement.off('mousemove touchmove pointermove');
      sliderElement.removeClass('opl-slider-active');
    }

    /**
     * Handles move events.
     *
     * While moving the value of the slider is updated.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleMove(event) {
      event.preventDefault();
      setValue(getSliderPressureValue(event));
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
      bodyElement.on('mousemove touchmove pointermove', handleMove);

      setValue(getSliderPressureValue(event));
    }

    Object.defineProperties(ctrl, {

      /**
       * The slider ARIA label.
       *
       * @property label
       * @type String
       */
      label: {
        value: 'Select a value',
        writable: true
      },

      /**
       * The slider value.
       *
       * @property value
       * @type Number
       */
      value: {
        value: 0,
        writable: true
      },

      /**
       * The human readable text alternative of the slider value.
       *
       * @property valueText
       * @type String
       */
      valueText: {
        value: '',
        writable: true
      },

      /**
       * Parameters for the human readable text alternative of the slider value.
       *
       * @property valueTextParameters
       * @type Object
       */
      valueTextParameters: {
        value: null,
        writable: true
      },

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

          computeSliderElementBoundingRectangle();
          updateUI();

          sliderElement.on('keydown', handleKeyDown);
          sliderElement.on('focus', handleFocus);
          sliderElement.on('blur', handleBlur);
          sliderElement.on('mousedown pointerdown touchstart', handleDown);
          angular.element($window).on('resize', handleResize);
        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          sliderElement.off('mousedown pointerdown touchstart keydown focus blur');
          bodyElement.off('mouseup pointerup touchend mousemove touchmove pointermove');
          thumbElement.off('transitionend');
          angular.element($window).off('resize');
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
            ctrl.label = (typeof newValue === 'undefined') ? 'Select a value' : newValue;
          }

          if (changedProperties.oplValueText && changedProperties.oplValueText.currentValue) {
            newValue = changedProperties.oplValueText.currentValue;
            ctrl.valueText = (typeof newValue === 'undefined') ? '' : newValue;
          }
        }
      }
    });

    /**
     * Updates the slider value from model.
     *
     * It overrides AngularJS $render.
     */
    ngModelCtrl.$render = function() {
      setValue(Math.min(100, Math.max(0, ngModelCtrl.$viewValue || 0)));
      updateUI();
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
    '$window'
  ];

})(angular.module('ov.player'));
