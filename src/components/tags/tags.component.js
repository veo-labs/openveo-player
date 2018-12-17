'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new Angular directive as an HTML element opl-tags to create a list of tags with title and description.
 *
 * Attributes are:
 * - [Array] **opl-tags**: The list of tags
 * - [Function] **opl-on-seek**: The function to call when a seek is performed on a tag
 *
 * e.g.
 * var tags = [
 *   {
 *     value: 10000,
 *     name: 'Tag title',
 *     description: 'Tag description'
 *   },
 *   [...]
 * ];
 *
 * var onSeek = function(tag) {
 *   console.log('Seek to tag "' + tag.name + '"');
 * };
 *
 * <opl-tags
 *   opl-tags="tags"
 *   opl-on-seek="onSeek(tag)"
 * ></opl-tags>
 *
 * @class oplTags
 */
(function(app) {

  app.component('oplTags', {
    templateUrl: 'opl-tags.html',
    controller: 'OplTagsController',
    bindings: {
      oplTags: '<',
      oplOnSeek: '&'
    }
  });

})(angular.module('ov.player'));
