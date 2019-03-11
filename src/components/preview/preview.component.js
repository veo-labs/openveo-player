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
 * - [String] **opl-url** The image URL
 *
 * @example
 *     var time = 42000;
 *     var url = 'http://local.url/image.jpg';
 *
 *     <opl-preview
 *                  opl-time="time"
 *                  opl-url="url"
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
      oplUrl: '<'
    }
  });

})(angular.module('ov.player'));
