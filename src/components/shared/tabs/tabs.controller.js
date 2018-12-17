'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplTabs component.
   *
   * @param {Object} $filter The AngularJS $filter service
   * @class OplTabsController
   * @constructor
   */
  function OplTabsController($filter) {
    var ctrl = this;

    Object.defineProperties(ctrl, {

      /**
       * The list of registered views.
       *
       * @property views
       * @type Array
       * @final
       */
      views: {
        value: []
      },

      /**
       * Selects a tab.
       *
       * @method selectViewById
       * @param {String} viewId The id of the view to select
       */
      selectViewById: {
        value: function(viewId) {
          var view = $filter('filter')(ctrl.views, {
            oplViewId: viewId
          },
          true);
          if (view.length != 0)
            ctrl.select(view[0]);
        }
      },

      /**
       * Adds the scope of an oplView directive to the list of tabs.
       *
       * @method addView
       * @param {Object} view The oplView to add to tabs
       */
      addView: {
        value: function(view) {
          if (!ctrl.views.length)
            ctrl.select(view);

          ctrl.views.push(view);
        }
      },

      /**
       * Removes an oplView directive from the list of tabs.
       *
       * @method removeView
       * @param {Object} view The oplView to remove from tabs
       */
      removeView: {
        value: function(view) {
          var index = ctrl.views.indexOf(view);

          if (index !== -1)
            ctrl.views.splice(index, 1);
        }
      },

      /**
       * Selects a view.
       *
       * @method select
       * @param {Object} view The oplView to select
       */
      select: {
        value: function(view) {
          angular.forEach(ctrl.views, function(view) {
            view.selected = false;
          });
          view.selected = true;
        }
      }

    });

  }

  app.controller('OplTabsController', OplTabsController);
  OplTabsController.$inject = ['$filter'];

})(angular.module('ov.player'));
