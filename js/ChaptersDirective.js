'use strict';

(function(app) {

  /**
   * Creates a new HTML element ov-index to create an openVeo player
   * index, with a list of presentation slides.
   * It requires ovPlayerDirectory global variable to be defined and have
   * a value corresponding to the path of the openVeo Player
   * root directory.
   *
   * e.g.
   * <ov-index></ov-index>
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

      scope.open = function(chapter) {
        if (chapter.description && chapter.description != '') {
          if (!chapter.isOpen)
            angular.forEach(scope.chapters, function(value) {
              value.isOpen = false;
            });
          chapter.isOpen = !chapter.isOpen;
        }
      };

      /**
       * Seeks media to the given timecode.
       * @param Number timecode The timecode to seek to
       */
      scope.goToTimecode = function(time) {
        var playerCtrl = controllers[0],
          tabsCtrl = controllers[1];
        if (time <= 1)
          playerCtrl.setTime(time * scope.duration);
        tabsCtrl.selectTabs('media');
      };

    };
  });

  app.directive('ovChapters', ovChapters);
  ovChapters.$inject = ['ovChaptersLink'];

})(angular.module('ov.player'));
