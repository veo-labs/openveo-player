'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-settings HTML element to create player settings.
 *
 * opl-settings is composed of a button and a list of settings (qualities and sources). The button and the list of
 * settings use the OpenVeo Player Icons font.
 *
 * Attributes are:
 * - [Array] **opl-qualities** The list of available video qualities
 * - [Array] **opl-sources** The list of available video sources
 * - [String] **opl-quality** The selected quality
 * - [String] **opl-source** The selected source
 * - [Function] **opl-on-update** The function to call when quality or source changes
 * - [Function] **opl-on-focus** The function to call when component enters in focus state
 *
 * Requires:
 * - **oplTranslate** OpenVeo Player i18n filter
 *
 * @example
 *      var handleOnUpdate = function(quality, source) {
 *        if (quality) console.log('Quality selected:' + quality);
 *        if (source) console.log('Source selected:' + source);
 *      };
 *      var handleOnFocus = function() {
 *        console.log('Component has received focus');
 *      };
 *      var qualities = [
 *        {id: '1', label: '360p', hd: false},
 *        {id: '2', label: '720p', hd: true}
 *      ];
 *      var sources = [
 *        {id: '1', label: 'Source 1'},
 *        {id: '2', label: 'Source 2'}
 *      ];
 *
 *      <opl-settings
 *                    opl-qualities="qualities"
 *                    opl-sources="sources"
 *                    opl-quality="2"
 *                    opl-source="1"
 *                    opl-on-update="handleOnUpdate(quality, source)"
 *                    opl-on-focus="handleOnFocus()"
 *      ></opl-settings>
 *
 * @class oplSettings
 */
(function(app) {

  app.component('oplSettings', {
    templateUrl: 'opl-settings.html',
    controller: 'OplSettingsController',
    bindings: {
      oplQualities: '<',
      oplSources: '<',
      oplQuality: '@?',
      oplSource: '@?',
      oplOnUpdate: '&',
      oplOnFocus: '&'
    }
  });

})(angular.module('ov.player'));
