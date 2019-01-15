'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-button HTML element to create a simple button.
 *
 * opl-button is composed of an icon, a focus ring and a ripple.
 *
 * Attributes are:
 * - [String] **opl-icon** The ligature name of the icon to use (from "OpenVeo-Player-Icons" font)
 * - [String] **opl-label** The ARIA label to apply to the button. Empty by default.
 * - [Boolean] **opl-no-sequential-focus** true to set button tabindex to -1, false to set button tabindex to 0
 * - [Function] **opl-on-update** The function to call when actioned
 * - [Function] **opl-on-focus** The function to call when component enters in focus state
 *
 * @example
 *      var handleOnUpdate = function() {
 *        console.log('Button actioned');
 *      };
 *      var handleOnFocus = function() {
 *        console.log('Component has received focus');
 *      };
 *
 *     <opl-button
 *                 opl-icon="settings"
 *                 opl-label="Settings"
 *                 opl-no-sequential-focus="false"
 *                 opl-on-update="handleOnUpdate()"
 *                 opl-on-focus="handleOnFocus()"
 *     ></opl-button>
 *
 * @class oplButton
 */
(function(app) {

  app.component('oplButton', {
    templateUrl: 'opl-button.html',
    controller: 'OplButtonController',
    bindings: {
      oplIcon: '@?',
      oplLabel: '@?',
      oplNoSequentialFocus: '@?',
      oplOnUpdate: '&',
      oplOnFocus: '&'
    }
  });

})(angular.module('ov.player'));
