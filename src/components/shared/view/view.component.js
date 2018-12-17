'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new Angular directive as HTML element opl-view to be able to group HTML elements which will be added to
 * an opl-tabs element.
 *
 * Available attributes are:
 *  - [String] **opl-title**: The title that will be display in the tab corresponding to the view
 *  - [String] **opl-view**: A CSS class that will be added to the main container of the view
 *  - [String] **opl-view-id**: The view identifier
 *
 * e.g.
 * <opl-tabs>
 *  <opl-view opl-title="Tab 1 title" opl-view="view-1" opl-view-id="view1">
 *    Content of the first view
 *  </opl-view>
 *  <opl-view opl-title="Tab 2 title" opl-view="view-2" opl-view-id="view1">
 *    Content of the second view
 *  </opl-view>
 * </opl-tabs>
 *
 * @class oplView
 */
(function(app) {

  app.component('oplView', {
    templateUrl: 'opl-view.html',
    controller: 'OplViewController',
    require: ['^oplTabs'],
    transclude: true,
    bindings: {
      oplTitle: '@',
      oplView: '@',
      oplViewId: '@'
    }
  });

})(angular.module('ov.player'));
