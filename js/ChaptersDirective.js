'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-chapters to create a list of chapters with title and
   * description.
   * It requires ovPlayerDirectory global variable to be defined and have a value corresponding to the path of
   * the openVeo Player root directory.
   *
   * e.g.
   * <ov-chapters></ov-chapters>
   *
   * @module ov.player
   * @class ovChapters
   */
  function ovChapters(ovChaptersLink) {
    return {
      require: ['^ovPlayer', '^ovTabs'],
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/chapters.html',
      scope: true,
      link: ovChaptersLink
    };
  }

  app.factory('ovChaptersLink', function() {
    return function(scope, element, attrs, controllers) {

      /**
       * Seeks media to the given timecode.
       *
       * @param {Number} time The timecode to seek to
       */
      scope.goToTimecode = function(time) {
        var playerCtrl = controllers[0],
          tabsCtrl = controllers[1];
        if (time <= scope.duration)
          playerCtrl.setTime(time);
        tabsCtrl.selectTabs('media');
      };

    };
  });

  app.directive('ovChapters', ovChapters);
  ovChapters.$inject = ['ovChaptersLink'];

})(angular.module('ov.player'));
