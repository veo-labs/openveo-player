'use strict';

/**
 * @module ov.player
 */

/**
 * Creates a new AngularJS component as HTML element opl-view to be able to group HTML elements which will be added to
 * an opl-tabs element.
 *
 * Available attributes are:
 *  - [String] **opl-label** The ARIA label to apply to the button. Empty by default.
 *  - [String] **opl-class** A CSS class that will be added to the main container of the view
 *  - [String] **opl-view-id** The view identifier
 *  - [String] **opl-icon** The ligature name of the icon to use (from "OpenVeo-Player-Icons" font)
 *  - [Function] **opl-on-selected** Function to call when view has been selected
 *
 * @example
 *      var handleOnSelected = function(id) {
 *        console.log('View ' + id + ' has been selected');
 *      };
 *
 *      <opl-tabs>
 *        <opl-view
 *                  opl-label="Tab 1"
 *                  opl-class="view-1"
 *                  opl-view-id="view1"
 *                  opl-icon="icon1_ligature"
 *                  opl-on-selected="handleOnSelected(id)"
 *        >
 *          Content of the first view
 *        </opl-view>
 *        <opl-view
 *                  opl-label="Tab 2"
 *                  opl-class="view-2"
 *                  opl-view-id="view2"
 *                  opl-icon="icon2_ligature"
 *        >
 *          Content of the second view
 *        </opl-view>
 *      </opl-tabs>
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
      oplLabel: '@?',
      oplClass: '@?',
      oplViewId: '@',
      oplIcon: '@',
      oplOnSelect: '&'
    }
  });

})(angular.module('ov.player'));
