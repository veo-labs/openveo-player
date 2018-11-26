'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an ov-player-slider HTML element to be able to set a value between 0% and 100%
   * using a slider.
   *
   * ov-player-slider is based on the Material specification but implements it partially. Only the continuous slider
   * is implemented.
   *
   * It could have been the HTML type="range" slider unfortunately it is not enough customizable.
   * It could also have been the slider component from Material but it embeds more features than required by the OpenVeo
   * Player, it adds another dependency to the OpenVeo Player and an AngularJS wrapper should have been implemented
   * anyway.
   *
   * ov-player-slider is composed of a track bar and a thumb.
   *
   * Attributes are:
   *   - ov-step to set the step to use, it won't be possible to place the slider outside steps it set. Default to 0 (no
   *     step) meaning that the slider can be drag & drop at any value of the slider and will move one by one when using
   *     keyboard.
   *   - ov-label to set the ARIA label of the slider. Default to "Select a value".
   *
   * Requires:
   * - **$window** AngularJS $window service
   *
   * @example
   *     var sliderValue = 50;
   *
   *     <ov-player-slider
   *               ng-model="sliderValue"
   *               ov-step="10"
   *               ov-label="Select a value"
   *     >
   *     </ov-player-slider>
   *
   * @module ov.player
   * @class ovPlayerSlider
   */
  function ovPlayerSlider($window) {
    return {
      restrict: 'E',
      templateUrl: 'opl-slider.html',
      require: ['?ngModel'],
      replace: true,
      scope: {
        ovStep: '@?',
        ovLabel: '@?'
      },
      link: function(scope, sliderElement, attrs, controllers) {
        var sliderElementBoundingRectangle;
        var thumbElement;
        var trackElement;
        var ngModelCtrl = controllers[0];
        var bodyElement = angular.element($window.document.body);
        var preventFocus = false;
        var inTransition = false;
        var step = 1;

        /**
         * Updates and validates directive attributes.
         */
        function updateAttributes() {
          scope.ovStep = step = (!scope.ovStep) ? 0 : parseInt(scope.ovStep);
          scope.ovLabel = scope.label = (typeof scope.ovLabel === 'undefined') ? 'Select a value' : scope.ovLabel;
        }

        /**
         * Destroys the slider.
         *
         * Remove all DOM event listerners.
         */
        function destroy() {
          sliderElement.off('mousedown pointerdown touchstart keydown focus blur');
          bodyElement.off('mouseup pointerup touchend mousemove touchmove pointermove');
          thumbElement.off('transitionend');
          angular.element($window).off('resize');
        }

        /**
         * Updates model with actual value.
         *
         * @method updateModel
         */
        function updateModel() {
          ngModelCtrl.$setViewValue(scope.value);
          ngModelCtrl.$validate();
        }

        /**
         * Updates the user interface with current value.
         *
         * Thumb and track are updated to reflect the slider value.
         *
         * @method updateUI
         */
        function updateUI() {
          var percentage = scope.value / 100;

          if (inTransition) {
            var onTransitionEnd = function onTransitionEnd() {
              sliderElement.removeClass('ov-player-slider-in-transition');
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
          if (value === scope.value) return;

          // If a step is defined, adjust value to be in a step
          if (step) value = Math.round(value / step) * step;

          scope.value = value;
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
         *  - LEFT and BOTTOM keys to decrease by the step specified in the ov-step attribute
         *  - RIGHT and TOP keys to increase by the step specified in the ov-step attribute
         *  - BEGIN key to set slider value to 0
         *  - END key to set slider value to 100
         *
         * Captured keys will prevent default browser actions.
         * If key is supported the focus is placed on the slider element.
         *
         * @param {KeyboardEvent} event The captured event
         */
        function handleKeyDown(event) {
          var value = scope.value;

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
          sliderElement.addClass('ov-player-slider-focus');
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

          sliderElement.addClass('ov-player-slider-focus');
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
          sliderElement.removeClass('ov-player-slider-focus');
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
          sliderElement.removeClass('ov-player-slider-active');
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
          sliderElement.addClass('ov-player-slider-active');
          sliderElement.addClass('ov-player-slider-in-transition');

          bodyElement.on('mouseup pointerup touchend', handleUp);
          bodyElement.on('mousemove touchmove pointermove', handleMove);

          setValue(getSliderPressureValue(event));
        }

        /**
         * Initializes the slider.
         */
        function init() {
          thumbElement = angular.element(sliderElement[0].querySelector('.ov-player-slider-thumb-container'));
          trackElement = angular.element(sliderElement[0].querySelector('.ov-player-slider-track'));

          computeSliderElementBoundingRectangle();
          updateUI();

          sliderElement.on('keydown', handleKeyDown);
          sliderElement.on('focus', handleFocus);
          sliderElement.on('blur', handleBlur);
          sliderElement.on('mousedown pointerdown touchstart', handleDown);
          angular.element($window).on('resize', handleResize);

          scope.$watch('ovStep', updateAttributes);
          scope.$on('$destroy', destroy);
        }

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

        updateAttributes();
        init();
      }
    };
  }

  app.directive('ovPlayerSlider', ovPlayerSlider);
  ovPlayerSlider.$inject = ['$window'];

})(angular.module('ov.player'));
