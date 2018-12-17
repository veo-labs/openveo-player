'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplTags component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $sce AngularJS $sce service
   * @class OplTagsController
   * @constructor
   */
  function OplTagsController($element, $sce) {
    var ctrl = this;

    /**
     * Simplifies a MIME type.
     *
     * @param {String} mimeType The complete MIME type
     * @return The simplified MIME type or the complete one if it can't be simplified
     */
    function getSimplifiedMimeType(mimeType) {
      if (mimeType.substr(0, 'image'.length) == 'image') return 'image';
      if (mimeType.substr(0, 'video'.length) == 'video') return 'video';
      if (mimeType.substr(0, 'audio'.length) == 'audio') return 'audio';
      return mimeType;
    }

    Object.defineProperties(ctrl, {

      /**
       * The selected tag.
       *
       * @property selectedTag
       * @type Object
       */
      selectedTag: {
        value: null,
        writable: true
      },

      /**
       * Calls oplOnSeek with a tag.
       *
       * @method goToTag
       * @param {Object} tag The tag
       */
      goToTag: {
        value: function(tag) {
          if (ctrl.oplOnSeek) ctrl.oplOnSeek({tag: tag});
        }
      },

      /**
       * Selects a tag.
       *
       * @method selectTag
       * @param {Object} tag The tag to select
       */
      selectTag: {
        value: function(tag) {
          ctrl.selectedTag = tag;

          if (!ctrl.selectedTag.file) return;
          ctrl.selectedTag.simpleMimeType = getSimplifiedMimeType(ctrl.selectedTag.file.mimetype);
          ctrl.selectedTag.src = ctrl.selectedTag.file.basePath;
        }
      },

      /**
       * Escapes HTML.
       *
       * @method trustedHTML
       * @param {String} html The HTML code to escape
       */
      trustedHTML: {
        value: function(html) {
          return $sce.trustAsHtml(html);
        }
      }

    });

  }

  app.controller('OplTagsController', OplTagsController);
  OplTagsController.$inject = ['$element', '$sce'];

})(angular.module('ov.player'));
