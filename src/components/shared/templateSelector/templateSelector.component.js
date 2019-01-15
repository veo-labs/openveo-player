'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as an opl-template-selector HTML element to create a player templates selector.
 *
 * opl-template-selector is composed of a button and a list of templates. The button and the list of templates use the
 * OpenVeo Player Icons font. The button icon reflects the template actually selected.
 *
 * Attributes are:
 * - [String] **opl-template** The template to choose, either "split_1", "split_2", "split_50_50" or "split_25_75"
 * - [String] **opl-label** The ARIA label of the slider. Default to "Select a value"
 * - [Function] **opl-on-update** The function to call when a new template is chosen
 * - [Function] **opl-on-focus** The function to call when component enters in focus state
 *
 * Requires:
 * - **oplTranslate** OpenVeo Player i18n filter
 *
 * @example
 *      var handleOnUpdate = function(template) {
 *        console.log('New selected template:' + template);
 *      };
 *      var handleOnFocus = function() {
 *        console.log('Component has received focus');
 *      };
 *      var template = 'split_1';
 *
 *     <opl-template-selector
 *                            opl-template="template"
 *                            opl-label="Choose a template"
 *                            opl-on-update="handleOnUpdate(template)"
 *                            opl-on-focus="handleOnFocus()"
 *     ></opl-template-selector>
 *
 * @class oplTemplateSelector
 */
(function(app) {

  app.component('oplTemplateSelector', {
    templateUrl: 'opl-templateSelector.html',
    controller: 'OplTemplateSelectorController',
    bindings: {
      oplTemplate: '@?',
      oplLabel: '@?',
      oplOnUpdate: '&',
      oplOnFocus: '&'
    }
  });

})(angular.module('ov.player'));
