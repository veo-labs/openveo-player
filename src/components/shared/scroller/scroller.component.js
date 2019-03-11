'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-scroller HTML element to scroll a content.
 *
 * opl-scroller is composed of a container, the transcluded content to scroll and a scroll bar.
 *
 * Scroller value must be between 0 and 100.
 *
 * Attributes are:
 * - [String] **opl-id** The unique id of the scrollable content.
 * - [Number] **opl-step** The step to use when scrolling using keyboard (Default to 10).
 * - [Boolean] **opl-no-sequential-focus** true to set scrollbar tabindex to -1, false to set scrollbar tabindex to 0
 * - [Boolean] **opl-deactivated** "true" to deactivate the scroller
 * - [String] **opl-orientation** The scrollbar orientation, either "horizontal" or "vertical"
 * - [Function] **opl-on-touch** The function to call when scroll is manipulated by the user
 * - [Function] **opl-on-ready** The function to call when the scroller is ready
 *
 * @example
 *      var value = 42;
 *      var deactivated = false;
 *
 *      var handleScrollTouch = function() {
 *        console.log('Scroller manually updated');
 *      };
 *
 *      var handleOnReady = function() {
 *        console.log('Scroller ready');
 *      };
 *
 *      <opl-scroller
 *                    ng-model="value"
 *                    opl-id="content-id"
 *                    opl-step="10"
 *                    opl-no-sequential-focus="false"
 *                    opl-deactivated="deactivated"
 *                    opl-orientation="vertical"
 *                    opl-on-touch="handleScrollTouch()"
 *                    opl-on-ready="handleOnReady()"
 *      ></opl-scroller>
 *
 * @class oplScroller
 */
(function(app) {

  app.component('oplScroller', {
    templateUrl: 'opl-scroller.html',
    controller: 'OplScrollerController',
    require: ['?ngModel'],
    transclude: true,
    bindings: {
      oplId: '@?',
      oplStep: '@?',
      oplNoSequentialFocus: '@?',
      oplDeactivated: '<',
      oplOrientation: '@?',
      oplOnTouch: '&',
      oplOnReady: '&'
    }
  });

})(angular.module('ov.player'));
