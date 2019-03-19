'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-preview HTML element to create a time related image preview.
 *
 * opl-preview is composed of a time and an image related to this time.
 *
 * Attributes are:
 * - [Number] **opl-time** The time in milliseconds
 * - [Object|String] **opl-image** The image URL or the sprite image description object with:
 *   - [String] **url** Sprite URL
 *   - [Number] **x** x coordinate of the image in the sprite
 *   - [Number] **y** y coordinate of the image in the sprite
*    Image size must be 142 pixels width and 80 pixels height
 *
 * @example
 *     var time = 42000;
 *     var image = {
 *       url: 'http://local.url/sprite.jpg',
 *       x: 142,
 *       y: 0,
 *     };
 *
 *     <opl-preview
 *                  opl-time="time"
 *                  opl-image="image"
 *     ></opl-preview>
 *
 * @class oplPreview
 */
(function(app) {

  app.component('oplPreview', {
    templateUrl: 'opl-preview.html',
    controller: 'OplPreviewController',
    bindings: {
      oplTime: '<',
      oplImage: '<'
    }
  });

})(angular.module('ov.player'));
