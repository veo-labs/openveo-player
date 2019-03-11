'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as HTML element opl-tabs to be able to manage a list of views (opl-view elements)
 * and switch between them using tabs.
 *
 * opl-tabs element does not have any attributes.
 *
 * Attributes are:
 * - [String] **opl-no-tabs** "true" to hide tabs (without hiding the view)
 * - [Function] **opl-on-select** The function to call when a view is actioned
 *
 * @example
 *      var handleOnSelect = function() {
 *        console.log('Button actioned');
 *      };
 *
 *      <opl-tabs opl-on-select="handleOnSelect" opl-no-tabs="false">
 *        <opl-view opl-label="Tab 1" opl-view-id="view1">
 *          Content of the first view
 *        </opl-view>
 *        <opl-view opl-label="Tab 2" opl-view-id="view2">
 *          Content of the second view
 *        </opl-view>
 *      </opl-tabs>
 *
 * @class oplTabs
 */
(function(app) {

  app.component('oplTabs', {
    templateUrl: 'opl-tabs.html',
    controller: 'OplTabsController',
    transclude: true,
    bindings: {
      oplNoTabs: '@?',
      oplOnSelect: '&'
    }
  });

})(angular.module('ov.player'));
