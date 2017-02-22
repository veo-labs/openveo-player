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
   * @class ovTags
   */
  function ovTags(ovTagsLink) {
    return {
      require: ['^ovPlayer', '^ovTabs'],
      restrict: 'E',
      templateUrl: ovPlayerDirectory + 'templates/tags.html',
      scope: true,
      link: ovTagsLink
    };
  }

  app.factory('ovTagsLink', function() {
    return function(scope, element, attrs, controllers) {
      scope.controller = controllers[0];

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

      scope.setTagSrc = function(tag) {
        scope.selectedTag = tag;
        if (scope.selectedTag.file)
          scope.selectedTagSrc = '/publish/' + scope.data.id + '/uploads/' + scope.selectedTag.file.filename;
      };
    };
  });

  app.directive('ovTags', ovTags);
  ovTags.$inject = ['ovTagsLink'];

})(angular.module('ov.player'));
