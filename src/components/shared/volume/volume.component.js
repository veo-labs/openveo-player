'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-volume HTML element to create a volume controller.
 *
 * opl-volume is composed of a opl-toggle-icon-button component (mute / unmute button) and a opl-slider
 * component (volume controller).
 *
 * Attributes are:
 * - [Function] **opl-on-focus** The function to call when component enters in focus state
 * - [Function] **opl-on-open** The function to call when volume controller is opened
 * - [Function] **opl-on-close** The function to call when volume controller is closed
 *
 * @example
 *     var handleOnFocus = function() {
 *       console.log('Component has received focus');
 *     };
 *     var handleOnOpen = function() {
 *       console.log('Volume controller is opened');
 *     };
 *     var handleOnClose = function() {
 *       console.log('Volume controller is closed');
 *     };
 *     var volumeLevel = 50;
 *
 *     <opl-volume
 *                 ng-model="volumeLevel"
 *                 opl-on-focus="handleOnFocus()"
 *                 opl-on-open="handleOnOpen()"
 *                 opl-on-close="handleOnClose()"
 *     ></opl-volume>
 *
 * Requires:
 * - **oplTranslate** OpenVeo Player i18n filter
 *
 * @class oplVolume
 */
(function(app) {

  app.component('oplVolume', {
    templateUrl: 'opl-volume.html',
    controller: 'OplVolumeController',
    require: ['?ngModel'],
    bindings: {
      oplOnFocus: '&',
      oplOnOpen: '&',
      oplOnClose: '&'
    }
  });

})(angular.module('ov.player'));
