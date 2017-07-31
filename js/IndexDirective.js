'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-index to create an openVeo player
   * index, with a list of presentation slides.
   *
   * e.g.
   * <ov-index></ov-index>
   *
   * @module ov.player
   * @class ovIndex
   */
  function ovIndex(ovIndexLink) {
    return {
      require: ['^ovPlayer', '^ovPlayerTabs'],
      restrict: 'E',
      templateUrl: 'ov-player-index.html',
      scope: true,
      link: ovIndexLink
    };
  }

  app.factory('ovIndexLink', function() {
    return function(scope, element, attrs, controllers) {

      if (scope.timecodes.length)
        scope.imagePreview = scope.timecodes[0].image.large;

      /**
       * Sets presentation preview corresponding to the given timecode.
       *
       * @param {Number} timecode The timecode (in milliseconds)
       */
      scope.setImagePreview = function(timecode) {
        scope.imagePreview = scope.timecodesByTime[timecode].image.large;
      };

      /**
       * Seeks media to the given timecode.
       *
       * @param {Number} timecode The timecode to seek to
       */
      scope.goToTimecode = function(timecode) {
        var playerCtrl = controllers[0],
          tabsCtrl = controllers[1];
        if (timecode <= scope.duration)
          playerCtrl.setTime(timecode);
        tabsCtrl.selectTabs('media');
      };

    };
  });

  app.directive('ovPlayerIndex', ovIndex);
  ovIndex.$inject = ['ovIndexLink'];

})(angular.module('ov.player'));
