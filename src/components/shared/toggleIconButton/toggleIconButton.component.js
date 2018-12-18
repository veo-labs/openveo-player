'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-toggle-icon-button HTML element to create a two states icon button to
 * switch on and off.
 *
 * opl-toggle-icon-button button does not change its state on its own, it only calls the oplOnUpdate function when
 * actioned.
 *
 * opl-toggle-icon-button is composed of an "off" icon, a "on" icon, a focus ring and a ripple.
 *
 * Attributes are:
 * - [Boolean] **opl-on** Either "true" ("on") or false ("off"). Default to false.
 * - [String] **opl-off-icon** The ligature name of the icon to use for the "off" state (from "OpenVeo-Player-Icons"
 *   font)
 * - [String] **opl-on-icon** The ligature name of the icon to use for the "on" state (from "OpenVeo-Player-Icons"
 *   font)
 * - [String] **opl-off-label** The ARIA label to apply to the button when state is "off". Empty by default.
 * - [String] **opl-on-label** The ARIA label to apply to the button when state is "on". Empty by default.
 * - [Function] **opl-on-update** The function to call when actioned
 * - [Function] **opl-on-focus** The function to call when component enters in focus state
 *
 * @example
 *      var handleOnUpdate = function(on) {
 *        console.log('Toggle button actioned');
 *      };
 *
 *     <opl-toggle-icon-button
 *                            opl-on="false"
 *                            opl-off-icon="play_arrow"
 *                            opl-on-icon="pause"
 *                            opl-off-label="Off ARIA label"
 *                            opl-on-label="On ARIA label"
 *                            opl-on-update="handleOnUpdate(on)"
 *                            opl-on-focus="handleOnFocus()"
 *     ></opl-toggle-icon-button>
 *
 * @class oplToggleIconButton
 */
(function(app) {

  app.component('oplToggleIconButton', {
    templateUrl: 'opl-toggleIconButton.html',
    controller: 'OplToggleIconButtonController',
    bindings: {
      oplOn: '@?',
      oplOffIcon: '@?',
      oplOnIcon: '@?',
      oplOffLabel: '@?',
      oplOnLabel: '@?',
      oplOnUpdate: '&',
      oplOnFocus: '&'
    }
  });

})(angular.module('ov.player'));
