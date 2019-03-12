'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-veo-labs-button HTML element to create a button linking to the Veo-Labs
 * web site.
 *
 * opl-veo-labs-button is composed of a link element which contains an SVG document.
 *
 * The SVG document is composed of:
 * - A SVG path which draws the Veo-Labs logotype
 * - A SVG path which also draws the logotype but clipped with a rectangle shape to create a ripple
 * - A SVG path which also draws the logotype but clipped with a circle shape to create a light
 *
 * Attributes are:
 * - [String] **opl-label** The ARIA label to apply to the link. Empty by default.
 * - [Function] **opl-on-focus** The function to call when link enters in focus state
 *
 * @example
 *      var handleOnFocus = function() {
 *        console.log('Component has received focus');
 *      };
 *
 *     <opl-veo-labs-button
 *                 opl-label="Go to Veo-Labs web site"
 *                 opl-on-focus="handleOnFocus()"
 *     ></opl-veo-labs-button>
 *
 * @class oplButton
 */
(function(app) {

  app.component('oplVeoLabsButton', {
    templateUrl: 'opl-veoLabsButton.html',
    controller: 'OplVeoLabsButtonController',
    bindings: {
      oplLabel: '@?',
      oplOnFocus: '&'
    }
  });

})(angular.module('ov.player'));
