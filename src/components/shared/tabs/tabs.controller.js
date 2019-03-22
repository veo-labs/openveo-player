'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplTabs component.
   *
   * @param {Object} $scope Component isolated scope
   * @param {Object} $filter The AngularJS $filter service
   * @param {Object} $element The component HTML element
   * @param {Object} $timeout AngularJS $timeout service
   * @class OplTabsController
   * @constructor
   */
  function OplTabsController($scope, $filter, $element, $timeout) {
    var ctrl = this;
    var tabsListElement;
    var tabsWrapperElement;
    var buttonElements;
    var leaveRequested = false;

    /**
     * Focus previous/next tab based on focused tab.
     *
     * @param {Boolean} next true to focus next tab, false to focus previous tab
     */
    function focusSiblingTab(next) {

      // Find focused tab
      var focusedTabIndex = 0;
      for (var i = 0; i < buttonElements.length; i++) {
        if (angular.element(buttonElements[i]).controller('oplButton').isFocused()) {
          focusedTabIndex = i;
          break;
        }
      }

      var siblingTabIndex = next ? focusedTabIndex + 1 : focusedTabIndex - 1;

      if (siblingTabIndex >= buttonElements.length) siblingTabIndex = 0;
      if (siblingTabIndex < 0) siblingTabIndex = buttonElements.length - 1;

      angular.element(buttonElements[siblingTabIndex]).controller('oplButton').focus();
    }

    /**
     * Updates the list of tab elements.
     */
    function updateTabElementsList() {
      $timeout(function() {
        buttonElements = angular.element($element[0].querySelectorAll('.opl-tabs opl-button'));
      });
    }

    /**
     * Handles keydown events.
     *
     * Tabs component captures the following keyboard keys:
     *  - LEFT and TOP keys to select previous tab
     *  - RIGHT and BOTTOM keys to select next tab
     *
     * Captured keys will prevent default browser actions.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      if ((event.key === 'Tab' || event.keyCode === 9) && event.shiftKey) {
        leaveRequested = true;
        return;
      } else if ((event.key === 'ArrowLeft' || event.keyCode === 37) ||
               (event.key === 'ArrowUp' || event.keyCode === 38)
      ) {
        focusSiblingTab(false);
      } else if ((event.key === 'ArrowRight' || event.keyCode === 39) ||
               (event.key === 'ArrowDown' || event.keyCode === 40)
      ) {
        focusSiblingTab(true);
      } else return;

      event.preventDefault();
    }

    /**
     * Handles focus event.
     *
     * Add focus class to the wrapper element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      tabsWrapperElement.addClass('opl-focus');

      if (leaveRequested) {
        leaveRequested = false;
        return;
      }

      angular.element(buttonElements[0]).controller('oplButton').focus();
    }

    /**
     * Handles blur event.
     *
     * Remove focus class from the wrapper element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      leaveRequested = false;
      tabsWrapperElement.removeClass('opl-focus');
    }

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
       * Selects a view.
       *
       * @method selectViewById
       * @param {String} viewId The id of the view to select
       */
      selectViewById: {
        value: function(viewId) {
          var view = $filter('filter')(
            ctrl.views,
            {
              oplViewId: viewId
            },
            true
          );
          if (view.length != 0) ctrl.select(view[0]);
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
          updateTabElementsList();
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

          updateTabElementsList();
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
      },

      /**
       * Gets selected view.
       *
       * @method getSelectedView
       * @return {Object} The selected view
       */
      getSelectedView: {
        value: function(view) {
          for (var i = 0; i < ctrl.views.length; i++) {
            if (ctrl.views[i].selected) return ctrl.views[i];
          }
          return null;
        }
      },

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          tabsWrapperElement = angular.element($element[0].querySelector('.opl-tabs-wrapper'));
          tabsListElement = angular.element($element[0].querySelector('.opl-tabs ul'));

          tabsListElement.on('keydown', handleKeyDown);
          tabsListElement.on('focus', handleFocus);
          tabsListElement.on('blur', handleBlur);
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {
          updateTabElementsList();
        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          tabsListElement.off('keydown focus blur');
        }
      }

    });

    /**
     * Handles tab buttons actions.
     *
     * Call the function defined in "opl-on-select" attribute with the actioned view.
     *
     * @method handleButtonAction
     * @param {Object} view The view actioned
     */
    $scope.handleButtonAction = function(view) {
      if (ctrl.oplOnSelect) ctrl.oplOnSelect({view: view});
    };

  }

  app.controller('OplTabsController', OplTabsController);
  OplTabsController.$inject = ['$scope', '$filter', '$element', '$timeout'];

})(angular.module('ov.player'));
