'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-slider HTML element to be able to set a value between 0% and 100%
 * using a slider.
 *
 * opl-slider is based on the Material specification but implements it partially. Only the continuous slider is
 * implemented.
 *
 * It could have been the HTML type="range" slider unfortunately it is not enough customizable.
 * It could also have been the slider component from Material but it embeds more features than required by the OpenVeo
 * Player, it adds another dependency to the OpenVeo Player and an AngularJS wrapper should have been implemented
 * anyway.
 *
 * opl-slider is composed of a track bar and a thumb.
 *
 * Attributes are:
 * - [Number] **opl-step** The step to use, it won't be possible to place the slider outside steps it set.
 *   Default to 0 (no step) meaning that the slider can be drag & drop at any value of the slider and will move one by
 *   one when using keyboard.
 * - [String] **opl-label** The ARIA label of the slider. Default to "Select a value".
 * - [String] **opl-value-text** The human readable text alternative of the slider value. Text will be processed by
 *   oplTranslate filter and supports parameter "%value%". Empty by default.
 * - [Boolean] **opl-no-sequential-focus** true to set slider tabindex to -1, false to set slider tabindex to 0
 * - [Function] **opl-on-focus** The function to call when component enters in focus state
 * - [Function] **opl-on-over** The function to call when pointer enters the component
 * - [Function] **opl-on-out** The function to call when pointer leaves the component
 * - [Function] **opl-on-move** The function to call when pointer moves over the component
 *
 * Requires:
 * - **oplTranslate** OpenVeo Player i18n filter
 *
 * @example
 *     var handleOnFocus = function() {
 *       console.log('Component has received focus');
 *     };
 *     var handleOnOver = function() {
 *       console.log('Pointer has entered the component');
 *     };
 *     var handleOnOut = function() {
 *       console.log('Pointer has left the component');
 *     };
 *     var handleOnMove = function(value, coordinates, sliderBoundingRectangle) {
 *       console.log(
 *         'Pointer has moved over value ' + value + ' in coordinates (' + coordinates.x + ',' + coordinates.y + ')'
 *       );
 *       console.log(sliderBoundingRectangle);
 *     };
 *     var sliderValue = 50;
 *
 *     <opl-slider
 *               ng-model="sliderValue"
 *               opl-step="10"
 *               opl-label="Select a value"
 *               opl-value-text="Slider value is: %value%"
 *               opl-no-sequential-focus="false"
 *               opl-on-focus="handleOnFocus()"
 *               opl-on-over="handleOnOver()"
 *               opl-on-out="handleOnOut()"
 *               opl-on-move="handleOnMove(value, coordinates)"
 *     ></opl-slider>
 *
 * @class oplSlider
 */
(function(app) {

  app.component('oplSlider', {
    templateUrl: 'opl-slider.html',
    controller: 'OplSliderController',
    require: ['?ngModel'],
    bindings: {
      oplStep: '@?',
      oplLabel: '@?',
      oplValueText: '@?',
      oplNoSequentialFocus: '@?',
      oplOnFocus: '&',
      oplOnOver: '&',
      oplOnOut: '&',
      oplOnMove: '&'
    }
  });

})(angular.module('ov.player'));
