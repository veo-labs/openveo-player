'use strict';

(function(app) {

  /**
   * Creates a new Angular directive as an HTML element ov-chapters to create a list of chapters with title and
   * description.
   *
   * e.g.
   * <ov-chapters></ov-chapters>
   *
   * @module ov.player
   * @class ovChapters
   */
  function ovChapters(ovChaptersLink) {
    return {
      require: ['^ovPlayer', '^ovPlayerTabs'],
      restrict: 'E',
      templateUrl: 'ov-player-chapters.html',
      scope: true,
      link: ovChaptersLink
    };
  }

  app.factory('ovChaptersLink', ['$sce', function($sce) {
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

      scope.trustedHTML = function(string) {
        return $sce.trustAsHtml(string);
      };
    };
  }]);

  app.directive('ovPlayerChapters', ovChapters);
  ovChapters.$inject = ['ovChaptersLink'];

})(angular.module('ov.player'));
