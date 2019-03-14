'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplSettings component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout The AngularJS $timeout service
   * @param {Object} $q The AngularJS $q service
   * @param {Object} $window The AngularJS $window service
   * @param {Object} oplDomFactory Helper to manipulate the DOM
   * @class OplSettingsController
   * @constructor
   */
  function OplSettingsController($scope, $element, $timeout, $q, $window, oplDomFactory) {
    var ctrl = this;
    var bodyElement;
    var buttonElement;
    var dialogElement;
    var settingsElement;
    var itemElements;
    var settingsTimer;
    var leavingAsked = false;
    var computing = false;
    var initialized = false;

    /**
     * Finds a settings item element by id.
     *
     * @param {String} id The item id
     * @return {HTMLElement} The item element or null if not found
     */
    function findItemElement(id) {
      if (!itemElements) return null;

      for (var i = 0; i < itemElements.length; i++) {
        if (angular.element(itemElements[i]).attr('data-id') === id)
          return itemElements[i];
      }
      return null;
    }

    /**
     * Focuses a settings item element.
     *
     * @param {String} id The id of the item to focus
     */
    function focusItem(id) {
      for (var i = 0; i < itemElements.length; i++) {
        if (angular.element(itemElements[i]).attr('data-id') === id) {
          itemElements[i].focus();
          break;
        }
      }
    }

    /**
     * Focus previous/next settings item based on focused item.
     *
     * @param {Boolean} next true to focus next item, false to focus previous item
     */
    function focusSiblingItem(next) {

      // Find focused item index
      var focusedItemIndex;
      for (focusedItemIndex = 0; focusedItemIndex < itemElements.length; focusedItemIndex++) {
        if (angular.element(itemElements[focusedItemIndex]).hasClass('opl-focus')) break;
      }

      var siblingItemIndex = next ? focusedItemIndex + 1 : focusedItemIndex - 1;

      if (siblingItemIndex >= itemElements.length) siblingItemIndex = 0;
      if (siblingItemIndex < 0) siblingItemIndex = itemElements.length - 1;

      focusItem(angular.element(itemElements[siblingItemIndex]).attr('data-id'));
    }

    /**
     * Calculates the position of the dialog.
     */
    function computeDialogSize() {
      settingsElement.attr(
        'style',
        '--opl-settings-dialog-height: ' + dialogElement[0].clientHeight + 'px;'
      );
    }

    /**
     * Animates deactivation of a settings item.
     *
     * Deactivation is performed only if activation activation is ended.
     *
     * @param {String} id The id of the item to deactivate
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateItemDeactivation(id) {
      var itemElement = findItemElement(id);
      if (!itemElement || !itemElement.deactivationAnimationRequested || itemElement.activationTimer) return $q.when();
      var deferred = $q.defer();

      itemElement.deactivationAnimationRequested = false;
      itemElement.activated = false;
      angular.element(itemElement).removeClass('opl-item-activation');

      // Start deactivation animation
      angular.element(itemElement).addClass('opl-item-deactivation');

      // An animation is associated to the opl-item-deactivation class, wait for it to finish before removing the
      // deactivation class
      // Delay corresponds to the animation duration
      itemElement.deactivationTimer = $timeout(function() {
        angular.element(itemElement).removeClass('opl-item-deactivation');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates activation of a settings item.
     *
     * @param {String} id The id of the item to activate
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateItemActivation(id) {
      var deferred = $q.defer();
      var itemElement = findItemElement(id);
      if (!itemElement) return $q.when();

      // Remove any ongoing activation / deactivation animations
      angular.element(itemElement).removeClass('opl-item-deactivation');
      if (itemElement.activationTimer) $timeout.cancel(itemElement.activationTimer);
      if (itemElement.deactivationTimer) $timeout.cancel(itemElement.deactivationTimer);

      // Start activation animation
      angular.element(itemElement).addClass('opl-item-activation');

      // Animation is associated to the opl-item-activation class, wait for it to finish before running the
      // deactivation animation.
      // Delay corresponds to the animation duration
      itemElement.activationTimer = $timeout(function() {
        itemElement.activationTimer = null;
        requestAnimationFrame(function() {
          animateItemDeactivation(id).then(function() {
            deferred.resolve();
          });
        });
      }, 225);

      return deferred.promise;
    }

    /**
     * Animates masking of settings.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateSettingsMasking() {
      if (settingsTimer || !ctrl.settingsOpened) return $q.when();
      var deferred = $q.defer();

      // Start masking animation
      settingsElement.addClass('opl-masking');
      settingsElement.removeClass('opl-posted');

      // An animation is associated to the opl-masking class, wait for it to finish before removing the masking class
      // Delay corresponds to the animation duration
      settingsTimer = $timeout(function() {
        settingsTimer = null;
        settingsElement.removeClass('opl-masking');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates posting of settings.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateSettingsPosting() {
      if (settingsTimer || ctrl.settingsOpened) return $q.when();
      var deferred = $q.defer();

      // Start posting animation
      settingsElement.addClass('opl-posting');

      // An animation is associated to the opl-posting class, wait for it to finish before running the animation
      // Delay corresponds to the animation duration
      settingsTimer = $timeout(function() {
        settingsTimer = null;
        settingsElement.addClass('opl-posted');
        settingsElement.removeClass('opl-posting');
        deferred.resolve();
      }, 250);

      return deferred.promise;
    }

    /**
     * Opens settings and focus the first item.
     *
     * @param {Boolean} unfocus true to prevent openSettings from focusing the first item
     */
    function openSettings(unfocus) {
      if (ctrl.settingsOpened) return;

      requestAnimationFrame(function() {
        animateSettingsPosting();
        ctrl.settingsOpened = true;
        if (!unfocus) focusItem(angular.element(itemElements[0]).attr('data-id'));
      });
    }

    /**
     * Closes settings and focus the button.
     *
     * @param {Boolean} unfocus true to prevent closeSettings from focusing the button
     */
    function closeSettings(unfocus) {
      if (!ctrl.settingsOpened) return;

      requestAnimationFrame(function() {
        animateSettingsMasking();
        ctrl.settingsOpened = false;
        if (buttonElement && !unfocus) buttonElement[0].focus();
      });
    }

    /**
     * Calls the oplOnUpdate function with the given quality and source.
     *
     * @param {String} [quality] The chosen quality
     * @param {String} [source] The chosen source
     */
    function callAction(quality, source) {
      if (ctrl.oplOnUpdate &&
        ((quality && quality !== ctrl.oplQuality) || (source && source !== ctrl.oplSource))
      ) {
        ctrl.oplOnUpdate({quality: quality, source: source});
      } else closeSettings();
    }

    /**
     * Handles keydown events.
     *
     * Settings captures the following keyboard keys dispatched by quality/source items:
     *  - RIGHT and BOTTOM keys to focus next quality/source
     *  - LEFT and TOP keys to focus previous quality/source
     *  - ENTER to validate a quality/source
     *  - ESCAPE to close settings
     *  - TAB to unfocus the component
     *
     * Captured keys will prevent default browser actions except for TAB key.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      if (((event.key === 'ArrowRight' || event.keyCode === 39) ||
          (event.key === 'ArrowDown' || event.keyCode === 40))
      ) {
        focusSiblingItem(true);
      } else if (((event.key === 'ArrowUp' || event.keyCode === 38) ||
          (event.key === 'ArrowLeft' || event.keyCode === 37))
      ) {
        focusSiblingItem(false);
      } else if (event.key === 'Enter' || event.keyCode === 13) {
        $scope.$apply(function() {
          if (angular.element(event.target).attr('data-type') === 'quality')
            callAction(angular.element(event.target).attr('data-id'));
          else
            callAction(null, angular.element(event.target).attr('data-id'));
        });
      } else if (event.key === 'Tab' || event.keyCode === 9) {
        leavingAsked = true;
        return;
      } else if (event.key === 'Escape' || event.keyCode === 27) {
        closeSettings();
      } else return;

      event.preventDefault();
    }

    /**
     * Handles release events.
     *
     * Deactivates the settings item and execute the action. After releasing, item is not longer active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleUp(event) {

      // Find item element from event. The event can come from one of item children or the item itself
      var itemElement = (!angular.element(event.target).attr('data-id')) ? event.target.parentNode : event.target;

      bodyElement.off('mouseup pointerup touchend', handleUp);

      // Deactivate all items
      itemElements.forEach(function(itemElement) {
        requestAnimationFrame(function() {
          itemElement.deactivationAnimationRequested = true;
          animateItemDeactivation(angular.element(itemElement).attr('data-id'));
        });
        itemElement.activated = false;
      });

      if (angular.element(itemElement).attr('data-type') === 'quality')
        callAction(angular.element(itemElement).attr('data-id'));
      else
        callAction(null, angular.element(itemElement).attr('data-id'));
    }

    /**
     * Handles pressed events.
     *
     * Activates item. Pressing the item makes it active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleDown(event) {

      // Find item element from event. The event can come from one of item children or the item itself
      var itemElement = (!angular.element(event.target).attr('data-id')) ? event.target.parentNode : event.target;

      if (itemElement.activated) return;

      itemElement.activated = true;
      bodyElement.on('mouseup pointerup touchend', handleUp);
      requestAnimationFrame(function() {
        animateItemActivation(angular.element(itemElement).attr('data-id'));
      });
    }

    /**
     * Handles settings item focus event.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {

      // Find item element from event. The event can come from one of item children or the item itself.
      var itemElement = (!angular.element(event.target).attr('data-id')) ? event.target.parentNode : event.target;

      angular.element(itemElement).addClass('opl-focus');
    }

    /**
     * Handles settings item blur event.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {

      // Find item element from event. The event can come from one of item children or the item itself.
      var itemElement = (!angular.element(event.target).attr('data-id')) ? event.target.parentNode : event.target;

      angular.element(itemElement).removeClass('opl-focus');

      if (leavingAsked) {
        closeSettings(true);
        leavingAsked = false;
      }
    }

    /**
     * Handles release events occuring outside of the settings element.
     *
     * Closes settings.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleBodyUp() {
      closeSettings(true);
    }

    /**
     * Initializes event listeners on the list of items (qualities and sources).
     */
    function setEventListeners() {
      angular.element(itemElements).on('keydown', handleKeyDown);
      angular.element(itemElements).on('mousedown pointerdown touchstart', handleDown);
      angular.element(itemElements).on('focus', handleFocus);
      angular.element(itemElements).on('blur', handleBlur);
      angular.element(bodyElement).on('mouseup pointerup touchend', handleBodyUp);
    }

    /**
     * Removes event listeners set with setEventListeners.
     */
    function clearEventListeners() {
      if (itemElements) {
        angular.element(itemElements).off(
          'keydown mousedown pointerdown touchstart mouseup pointerup touchend focus blur'
        );
      }
      bodyElement.off('mouseup pointerup touchend', handleBodyUp);
      bodyElement.off('mouseup pointerup touchend', handleUp);
    }

    Object.defineProperties(ctrl, {

      /**
       * Indicates if settings are opened or not.
       *
       * @property settingsOpened
       * @type {Boolean}
       */
      settingsOpened: {
        value: false,
        writable: true
      },

      /**
       * Resets the component.
       *
       * @method reset
       */
      reset: {
        value: function() {
          if (!initialized) return;
          computing = true;
          itemElements = settingsElement[0].querySelectorAll('li');
          buttonElement = angular.element($element[0].querySelector('.opl-button'));
          dialogElement = angular.element(settingsElement[0].querySelector('.opl-dialog'));

          $timeout(function() {
            computeDialogSize();
            clearEventListeners();
            setEventListeners();
            computing = false;
          }, 500);
        }
      },

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          bodyElement = angular.element($window.document.body);
          settingsElement = angular.element($element[0].querySelector('.opl-settings'));
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {
          initialized = true;

          // Wait for oplButton component and quality/source items.
          // Template for oplButton component is stored in cache and will be processed in next loop.
          $timeout(function() {
            ctrl.reset();
          });

        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          clearEventListeners();
        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplQuality] oplQuality old and new value
       * @param {String} [changedProperties.oplQuality.currentValue] oplQuality new value
       * @param {Object} [changedProperties.oplSource] oplSource old and new value
       * @param {String} [changedProperties.oplSource.currentValue] oplSource new value
       * @param {Object} [changedProperties.oplQualities] oplQualities old and new value
       * @param {String} [changedProperties.oplQualities.currentValue] oplQualities new value
       * @param {Object} [changedProperties.oplSources] oplSources old and new value
       * @param {String} [changedProperties.oplSources.currentValue] oplSources new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if ((changedProperties.oplQuality && changedProperties.oplQuality.currentValue) ||
              (changedProperties.oplSource && changedProperties.oplSource.currentValue)
          ) {
            closeSettings();
          }

          if ((changedProperties.oplQualities && changedProperties.oplQualities.currentValue) ||
             (changedProperties.oplSources && changedProperties.oplSources.currentValue)) {
            ctrl.reset();
          }
        }
      },

      /**
       * Shows/hides settings.
       *
       * @method toggleSettings
       */
      toggleSettings: {
        value: function() {
          if (computing) return;
          if (ctrl.settingsOpened) closeSettings();
          else openSettings();
        }
      }

    });

    /**
     * Handles button focus.
     */
    $scope.handleButtonFocus = function() {
      if (ctrl.oplOnFocus) ctrl.oplOnFocus();
    };

  }

  app.controller('OplSettingsController', OplSettingsController);
  OplSettingsController.$inject = [
    '$scope',
    '$element',
    '$timeout',
    '$q',
    '$window',
    'oplDomFactory'
  ];

})(angular.module('ov.player'));
