'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Helps manipulating DOM events.
   *
   * @class OplEventsFactory
   * @param {Object} $window AngularJS $window service
   * @constructor
   */
  function OplEventsFactory($window) {
    var EVENTS = {};

    if ($window.PointerEvent) {
      EVENTS.UP = 'pointerup';
      EVENTS.DOWN = 'pointerdown';
      EVENTS.MOVE = 'pointermove';
      EVENTS.OVER = 'pointerover';
      EVENTS.OUT = 'pointerout';
    } else if ($window.TouchEvent) {
      EVENTS.UP = 'touchend';
      EVENTS.DOWN = 'touchstart';
      EVENTS.MOVE = 'touchmove';
    } else {
      EVENTS.UP = 'mouseup';
      EVENTS.DOWN = 'mousedown';
      EVENTS.MOVE = 'mousemove';
      EVENTS.OVER = 'mouseover';
      EVENTS.OUT = 'mouseout';
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

    return {
      EVENTS: EVENTS,
      getUiEventCoordinates: getUiEventCoordinates
    };

  }

  app.factory('oplEventsFactory', OplEventsFactory);
  OplEventsFactory.$inject = ['$window'];

})(angular.module('ov.player'));
