'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Creates a filter to convert a time in milliseconds to an hours:minutes:seconds format.
   *
   * e.g.
   * {{60000 | oplMillisecondsToTime}} // 01:00
   * {{3600000 | oplMillisecondsToTime}} // 01:00:00
   *
   * @class oplMillisecondsToTime
   */
  function oplMillisecondsToTime() {
    return function(time) {
      if (time < 0 || isNaN(time))
        return '';

      time = parseInt(time);

      var seconds = parseInt((time / 1000) % 60);
      var minutes = parseInt((time / (60000)) % 60);
      var hours = parseInt((time / (3600000)) % 24);

      hours = (hours < 10) ? '0' + hours : hours;
      minutes = (minutes < 10) ? '0' + minutes : minutes;
      seconds = (seconds < 10) ? '0' + seconds : seconds;

      return ((hours !== '00') ? hours + ':' : '') + minutes + ':' + seconds;
    };
  }

  app.filter('oplMillisecondsToTime', oplMillisecondsToTime);

})(angular.module('ov.player'));
