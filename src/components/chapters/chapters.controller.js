'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplChapters component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $sce AngularJS $sce service
   * @class OplChaptersController
   * @constructor
   */
  function OplChaptersController($element, $sce) {
    var ctrl = this;

    Object.defineProperties(ctrl, {

      /**
       * Calls oplOnSeek with a chapter.
       *
       * @method goToChapter
       * @param {Object} chapter The chapter
       */
      goToChapter: {
        value: function(chapter) {
          if (ctrl.oplOnSeek) ctrl.oplOnSeek({chapter: chapter});
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

  app.controller('OplChaptersController', OplChaptersController);
  OplChaptersController.$inject = ['$element', '$sce'];

})(angular.module('ov.player'));
