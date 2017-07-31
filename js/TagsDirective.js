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
   * @class ovTags
   */
  function ovTags(ovTagsLink) {
    return {
      require: ['^ovPlayer', '^ovPlayerTabs'],
      restrict: 'E',
      templateUrl: 'ov-player-tags.html',
      scope: true,
      link: ovTagsLink
    };
  }

  app.factory('ovTagsLink', ['$sce', function($sce) {
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
        scope.simpleMimeType = scope.getFileMimeType();
        scope.selectedTagSrc = scope.simpleMimeType ? scope.selectedTag.file.basePath : null;
      };

      // Get simple mimetype
      scope.getFileMimeType = function() {
        if (!scope.selectedTag || !scope.selectedTag.file) return null;
        if (scope.selectedTag.file.mimetype.substr(0, 'image'.length) == 'image') return 'image';
        if (scope.selectedTag.file.mimetype.substr(0, 'video'.length) == 'video') return 'video';
        if (scope.selectedTag.file.mimetype.substr(0, 'audio'.length) == 'audio') return 'audio';
        return scope.selectedTag.file.mimetype;
      };

      scope.trustedHTML = function(string) {
        return $sce.trustAsHtml(string);
      };
    };
  }]);

  app.directive('ovPlayerTags', ovTags);
  ovTags.$inject = ['ovTagsLink'];

})(angular.module('ov.player'));
