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
 * e.g.
 * <opl-tabs>
 *  <opl-view opl-title="Tab 1 title" opl-view="view-1" opl-view-id="view1">
 *    Content of the first view
 *  </opl-view>
 *  <opl-view opl-title="Tab 2 title" opl-view="view-2" opl-view-id="view2">
 *    Content of the second view
 *  </opl-view>
 * </opl-tabs>
 *
 * @class oplTabs
 */
(function(app) {

  app.component('oplTabs', {
    templateUrl: 'opl-tabs.html',
    controller: 'OplTabsController',
    transclude: true,
    bindings: {}
  });

})(angular.module('ov.player'));
