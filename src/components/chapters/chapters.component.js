'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new Angular directive as an HTML element opl-chapters to create a list of chapters with title and
 * description.
 *
 * Attributes are:
 * - [Array] **opl-chapters**: The list of chapters
 * - [Function] **opl-on-seek**: The function to call when a seek is performed on a chapter
 *
 * e.g.
 * var chapters = [
 *   {
 *     value: 10000,
 *     name: 'Chapter title',
 *     description: 'Chapter description'
 *   },
 *   [...]
 * ];
 *
 * var onSeek = function(chapter) {
 *   console.log('Seek to chapter "' + chapter.name + '"');
 * };
 *
 * <opl-chapters
 *   opl-chapters="chapters"
 *   opl-on-seek="onSeek"
 * ></opl-chapters>
 *
 * @class oplChapters
 */
(function(app) {

  app.component('oplChapters', {
    templateUrl: 'opl-chapters.html',
    controller: 'OplChaptersController',
    bindings: {
      oplChapters: '<',
      oplOnSeek: '&'
    }
  });

})(angular.module('ov.player'));
