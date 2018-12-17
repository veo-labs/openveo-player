'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new Angular directive as an HTML element opl-indexes to create an openVeo player index, with a list of
 * presentation indexes.
 *
 * Attributes are:
 * - [Array] **opl-indexes**: The list of indexes
 * - [Number] **opl-time**: The actual time, all indexes before that time are displayed differently
 * - [Function] **opl-on-seek**: The function to call when a seek is performed on an index
 *
 * e.g.
 * var indexes = [
 *   {
 *     timecode: 10000,
 *     image: {
 *       small: "https://cdn.local/small-image.jpg",
 *       large: "https://cdn.local/large-image.jpg"
 *     }
 *   },
 *   [...]
 * ];
 *
 * var onSeek = function(index) {
 *   console.log('Seek to index with timecode "' + index.timecode + '"');
 * };
 *
 * <opl-indexes
 *   opl-indexes="indexes"
 *   opl-on-seek="onSeek"
 * ></opl-indexes>
 *
 * @class oplIndexes
 */
(function(app) {

  app.component('oplIndexes', {
    templateUrl: 'opl-indexes.html',
    controller: 'OplIndexesController',
    bindings: {
      oplIndexes: '<',
      oplTime: '<',
      oplOnSeek: '&'
    }
  });

})(angular.module('ov.player'));
