'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplTile component.
   *
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout The AngularJS $timeout service
   * @param {Object} $http The AngularJS $http service
   * @param {Object} $sce The AngularJS $sce service
   * @param {Object} $q The AngularJS $q service
   * @param {Object} $window The AngularJS $window service
   * @param {Object} oplDomFactory Helper to manipulate the DOM
   * @class OplTileController
   * @constructor
   */
  function OplTileController($scope, $element, $timeout, $http, $sce, $q, $window, oplDomFactory) {
    var ctrl = this;
    var ready = false;
    var descriptionScrollerReady = false;
    var reseting = false;
    var resetRequested = false;
    var initialized = false;
    var bodyElement;
    var tileElement;
    var abstractMoreInfoButtonElement;
    var abstractTitleElement;
    var abstractTimeIconElement;
    var abstractTimeElement;
    var fullTitleElement;
    var fullDescriptionScrollerElement;
    var fullDescriptionScrollerController;
    var fullAttachmentElement;
    var fullAttachmentButtonElement;
    var fullCloseButtonElement;
    var fullCloseButtonController;
    var activated;
    var attachmentActivated;
    var activationTimer;
    var activationAttachmentTimer;
    var deactivationTimer;
    var deactivationAttachmentTimer;
    var deactivationAnimationRequested;
    var deactivationAttachmentAnimationRequested;
    var tileHeight;

    /**
     * Finds elements in the DOM.
     */
    function findElements() {
      if (ctrl.oplAbstract) {

        // Abstract

        abstractTitleElement = angular.element($element[0].querySelector('.opl-abstract .opl-title'));
        abstractTimeElement = angular.element($element[0].querySelector('.opl-abstract .opl-access-time'));
        abstractMoreInfoButtonElement = angular.element($element[0].querySelector('.opl-abstract opl-button'));
        abstractTimeIconElement = angular.element(
          $element[0].querySelector('.opl-abstract .opl-access-time-icon')
        );
      } else {

        // Full

        if (ctrl.oplData.title)
          fullTitleElement = angular.element($element[0].querySelector('.opl-full .opl-title'));

        if (ctrl.oplData.description)
          fullDescriptionScrollerElement = angular.element($element[0].querySelector('.opl-full opl-scroller'));

        if (ctrl.oplData.file) {
          fullAttachmentElement = angular.element($element[0].querySelector('.opl-full .opl-attachment'));
          fullAttachmentButtonElement = angular.element(fullAttachmentElement[0].querySelector('a'));
        }

        fullCloseButtonElement = angular.element($element[0].querySelector('.opl-close-button opl-button'));
      }
    }

    /**
     * Preloads the small image of the tile (only if type is "image").
     */
    function preloadSmallImage() {
      if (!ctrl.oplData.image || !ctrl.oplData.image.small || ctrl.smallImagePreloading) return;
      ctrl.smallImagePreloading = true;

      $http.get(ctrl.oplData.image.small.url).then(function() {
        ctrl.smallImagePreloading = false;
        ctrl.smallImageError = false;
        ctrl.smallImagePreloaded = true;
      }).catch(function() {
        ctrl.smallImagePreloading = false;
        ctrl.smallImagePreloaded = true;
        ctrl.smallImageError = true;
      });
    }

    /**
     * Preloads the large image of the tile (only if type is "image").
     *
     * It calls the function defined in "opl-on-image-preloaded" attribute when preloaded, and the function defined in
     * "opl-on-image-error" attribute if preloading the image failed.
     */
    function preloadLargeImage() {
      if (!ctrl.oplData.image || !ctrl.oplData.image.large || ctrl.largeImagePreloading) return;
      ctrl.largeImagePreloading = true;

      var image = new Image();
      image.onload = function() {
        ctrl.largeImagePreloading = false;
        ctrl.largeImageError = false;
        ctrl.largeImageSize = {
          width: this.naturalWidth,
          height: this.naturalHeight
        };

        if (ctrl.oplOnImagePreloaded) {
          ctrl.oplOnImagePreloaded({
            tile: ctrl.oplData,
            size: ctrl.largeImageSize
          });
        }
      };
      image.onerror = function() {
        ctrl.largeImagePreloading = false;
        ctrl.largeImageError = true;

        if (ctrl.oplOnImageError) {
          ctrl.oplOnImageError({
            tile: ctrl.oplData
          });
        }
      };

      image.src = ctrl.oplData.image.large;
    }

    /**
     * Animates the deactivation of the tile.
     *
     * Deactivation is performed only if activation animation is ended and activation is ended.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateDeactivation() {
      if (!deactivationAnimationRequested || activationTimer) return $q.when();
      var deferred = $q.defer();

      deactivationAnimationRequested = false;
      activated = false;
      tileElement.removeClass('opl-activation');

      // Start deactivation animation
      tileElement.addClass('opl-deactivation');

      // An animation is associated to the "opl-deactivation" class, wait for it to finish before removing the
      // deactivation class
      // Delay corresponds to the animation duration
      deactivationTimer = $timeout(function() {
        tileElement.removeClass('opl-deactivation');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates the activation of the tile.
     *
     * Activation animation can be performed only if not activated.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateActivation() {
      var deferred = $q.defer();

      // Remove any ongoing activation / deactivation animations
      tileElement.removeClass('opl-deactivation');
      if (activationTimer) $timeout.cancel(activationTimer);
      if (deactivationTimer) $timeout.cancel(deactivationTimer);

      // Start activation animation
      tileElement.addClass('opl-activation');

      // An animation is associated to the "opl-activation" class, wait for it to finish before running the deactivation
      // animation
      // Delay corresponds to the animation duration
      activationTimer = $timeout(function() {
        activationTimer = null;
        requestAnimationFrame(function() {
          animateDeactivation().then(function() {
            deferred.resolve();
          });
        });
      }, 225);

      return deferred.promise;
    }

    /**
     * Animates the deactivation of the attachment button.
     *
     * Deactivation is performed only if activation animation is ended and activation is ended.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateAttachmentDeactivation() {
      if (!deactivationAttachmentAnimationRequested || activationAttachmentTimer) return $q.when();
      var deferred = $q.defer();

      deactivationAttachmentAnimationRequested = false;
      attachmentActivated = false;
      fullAttachmentButtonElement.removeClass('opl-attachment-activation');

      // Start deactivation animation
      fullAttachmentButtonElement.addClass('opl-attachment-deactivation');

      // An animation is associated to the "opl-attachment-deactivation" class, wait for it to finish before removing
      // the deactivation class
      // Delay corresponds to the animation duration
      deactivationAttachmentTimer = $timeout(function() {
        fullAttachmentButtonElement.removeClass('opl-attachment-deactivation');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates the activation of the attachment button.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateAttachmentActivation() {
      var deferred = $q.defer();

      // Remove any ongoing activation / deactivation animations
      fullAttachmentButtonElement.removeClass('opl-attachment-deactivation');
      if (activationAttachmentTimer) $timeout.cancel(activationAttachmentTimer);
      if (deactivationAttachmentTimer) $timeout.cancel(deactivationAttachmentTimer);

      // Start activation animation
      fullAttachmentButtonElement.addClass('opl-attachment-activation');

      // An animation is associated to the "opl-attachment-activation" class, wait for it to finish before running the
      // deactivation animation
      // Delay corresponds to the animation duration
      activationAttachmentTimer = $timeout(function() {
        activationAttachmentTimer = null;
        requestAnimationFrame(function() {
          animateAttachmentDeactivation().then(function() {
            deferred.resolve();
          });
        });
      }, 225);

      return deferred.promise;
    }

    /**
     * Gets title element height.
     *
     * @return {Number} The title height in pixels
     */
    function getTitleHeight() {
      if (!fullTitleElement || !fullTitleElement.length) return 0;
      return fullTitleElement[0].clientHeight;
    }

    /**
     * Gets attachment element height.
     *
     * @return {Number} The attachment height in pixels
     */
    function getAttachmentHeight() {
      if (!fullAttachmentElement || !fullAttachmentElement.length) return 0;
      return fullAttachmentElement[0].clientHeight;
    }

    /**
     * Computes description element height.
     */
    function getDescriptionHeight() {
      if (!tileHeight || !ctrl.oplData.description) return 0;
      return tileHeight - getTitleHeight() - getAttachmentHeight() - 8 * 2;
    }

    /**
     * Computes tile element height.
     *
     * @return {Promise} A promise resolving with tile height
     */
    function computeTileHeight() {
      var deferred = $q.defer();

      oplDomFactory.waitForElementDimension(tileElement[0], [{
        property: 'clientHeight',
        notEqual: 0
      }]).then(function(boundingRectangle) {
        deferred.resolve(boundingRectangle.clientHeight);
      }, function() {
        deferred.resolve(tileElement[0].clientHeight);
      });

      return deferred.promise;
    }

    /**
     * Handles release events.
     *
     * After releasing, tile is actioned and is not longer active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleUp(event) {
      bodyElement.off('mouseup pointerup touchend', handleUp);
      requestAnimationFrame(function() {
        deactivationAnimationRequested = true;
        animateDeactivation();
      });
      activated = false;

      if (ctrl.oplOnSelect) ctrl.oplOnSelect({tile: ctrl.oplData});
    }

    /**
     * Handles pressed events.
     *
     * Pressing the tile makes it active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleDown(event) {
      if (activated) return;

      activated = true;
      requestAnimationFrame(function() {
        animateActivation();
      });
      bodyElement.on('mouseup pointerup touchend', handleUp);
    }

    /**
     * Handles release events on attachment button.
     *
     * After releasing, attachment is actioned and is not longer active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleAttachmentUp(event) {
      bodyElement.off('mouseup pointerup touchend', handleAttachmentUp);

      requestAnimationFrame(function() {
        deactivationAttachmentAnimationRequested = true;
        animateAttachmentDeactivation();
      });
      attachmentActivated = false;
    }

    /**
     * Handles pressed events on attachment button.
     *
     * Pressing the attachment button makes it active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleAttachmentDown(event) {
      if (attachmentActivated) return;

      attachmentActivated = true;
      requestAnimationFrame(function() {
        animateAttachmentActivation();
      });
      bodyElement.on('mouseup pointerup touchend', handleAttachmentUp);
    }

    /**
     * Handles keydown events when tile is reduced.
     *
     * Tile captures the following keyboard keys:
     *  - ENTER to action the tile
     *  - TOP and BOTTOM keys to switch the focus between the tile and the "more info" button
     *
     * Captured keys will prevent default browser actions.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleAbstractKeyDown(event) {
      if ((event.key === 'Enter' || event.keyCode === 13)) {
        if (ctrl.oplOnSelect) ctrl.oplOnSelect({tile: ctrl.oplData});
      } else if ((event.key === 'ArrowUp' || event.keyCode === 38) ||
               (event.key === 'ArrowDown' || event.keyCode === 40)
      ) {
        var moreInfoButtonController = abstractMoreInfoButtonElement.controller('oplButton');
        if (moreInfoButtonController.isFocused()) {

          // "more info" button focused, focus tile
          ctrl.focus();

        } else {

          // Tile focused, focus the "more info" button
          moreInfoButtonController.focus();

        }
      } else return;

      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    /**
     * Handles keydown events when tile is enlarged.
     *
     * Tile captures the following keyboard keys:
     *  - TOP, BOTTOM, LEFT and RIGHT keys to navigate between elements (title, description, close button and
     *    attachment button) if tile type is "text"
     *  - ENTER key to action the close button or the attachment button if focused
     *  - ESCAPE key to close and return to reduced tile
     *
     * Captured keys will prevent default browser actions.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleFullKeyDown(event) {
      if ((event.key === 'ArrowUp' || event.keyCode === 38) ||
          (event.key === 'ArrowLeft' || event.keyCode === 37)
      ) {

        if (fullCloseButtonController.isFocused()) {

          // Close button is focused
          // Focus attachment button if any or description if any
          if (fullAttachmentButtonElement) fullAttachmentButtonElement[0].focus();
          else if (fullDescriptionScrollerController) fullDescriptionScrollerController.focus();

        } else if (fullDescriptionScrollerController && fullDescriptionScrollerController.isFocused()) {

          // Description is focused
          // Focus close button
          fullCloseButtonController.focus();

        } else if (fullAttachmentButtonElement && fullAttachmentButtonElement.hasClass('opl-focus')) {

          // Attachment button is focused
          // Focus description if any or close button
          if (fullDescriptionScrollerController) fullDescriptionScrollerController.focus();
          else fullCloseButtonController.focus();

        } else return;

      } else if ((event.key === 'ArrowDown' || event.keyCode === 40) ||
          (event.key === 'ArrowRight' || event.keyCode === 39)
      ) {

        if (fullCloseButtonController.isFocused()) {

          // Close button is focused
          // Focus description is any or attachment button if any
          if (fullDescriptionScrollerController) fullDescriptionScrollerController.focus();
          else if (fullAttachmentButtonElement) fullAttachmentButtonElement[0].focus();

        } else if (fullDescriptionScrollerController && fullDescriptionScrollerController.isFocused()) {

          // Description is focused
          // Focus attachment button if any or close button
          if (fullAttachmentButtonElement) fullAttachmentButtonElement[0].focus();
          else fullCloseButtonController.focus();

        } else if (fullAttachmentButtonElement && fullAttachmentButtonElement.hasClass('opl-focus')) {

          // Attachment button is focused
          // Focus close button
          fullCloseButtonController.focus();

        } else return;

      } else if (
        ((event.key === 'Enter' || event.keyCode === 13) && fullCloseButtonController.isFocused()) ||
        (event.key === 'Escape' || event.keyCode === 27)
      ) {
        if (ctrl.oplOnClose) ctrl.oplOnClose();
      } else return;

      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    /**
     * Handles keydown events.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      if (ctrl.oplAbstract) handleAbstractKeyDown(event);
      else handleFullKeyDown(event);
    }

    /**
     * Handles focus event.
     *
     * Add focus class to the tile HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      tileElement.addClass('opl-focus');
    }

    /**
     * Handles blur event.
     *
     * Remove focus class from the tile HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      tileElement.removeClass('opl-focus');
    }

    /**
     * Handles attachment button focus event.
     *
     * Add focus class to the attachment button HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleAttachmentFocus(event) {
      fullAttachmentButtonElement.addClass('opl-focus');
    }

    /**
     * Handles attachment button blur event.
     *
     * Remove focus class from the attachment button HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleAttachmentBlur(event) {
      fullAttachmentButtonElement.removeClass('opl-focus');
    }

    /**
     * Handles over event.
     *
     * Add over class to the tile HTML element.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleOver(event) {
      if (tileElement.hasClass('opl-over')) return;
      tileElement.addClass('opl-over');
    }

    /**
     * Handles out event.
     *
     * Remove over class from the tile HTML element.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleOut(event) {
      if (!tileElement.hasClass('opl-over')) return;
      tileElement.removeClass('opl-over');
    }

    /**
     * Sets event listeners on HTML elements of the tile component.
     */
    function setEventListeners() {
      if (ctrl.oplAbstract) {
        abstractTitleElement.on('mouseover pointerover', handleOver);
        abstractTitleElement.on('mouseout pointerout', handleOut);
        abstractTimeIconElement.on('mouseover pointerover', handleOver);
        abstractTimeIconElement.on('mouseout pointerout', handleOut);
        abstractTimeElement.on('mouseover pointerover', handleOver);
        abstractTimeElement.on('mouseout pointerout', handleOut);
        tileElement.on('mousedown pointerdown touchstart', handleDown);
      } else if (fullAttachmentButtonElement) {
        fullAttachmentButtonElement.on('mousedown pointerdown touchstart', handleAttachmentDown);
        fullAttachmentButtonElement.on('focus', handleAttachmentFocus);
        fullAttachmentButtonElement.on('blur', handleAttachmentBlur);
      }
      tileElement.on('focus', handleFocus);
      tileElement.on('blur', handleBlur);
      tileElement.on('keydown', handleKeyDown);
    }

    /**
     * Removes event listeners set with setEventListeners.
     */
    function clearEventListeners() {
      tileElement.off('mousedown pointerdown touchstart focus blur keydown');

      if (ctrl.oplAbstract) {
        if (abstractTitleElement && abstractTimeIconElement && abstractTimeElement) {
          abstractTitleElement.off('mouseover pointerover mouseout pointerout');
          abstractTimeIconElement.off('mouseover pointerover mouseout pointerout');
          abstractTimeElement.off('mouseover pointerover mouseout pointerout');
        }
        bodyElement.off('mouseup pointerup touchend', handleUp);
      } else {
        if (fullAttachmentButtonElement) {
          fullAttachmentButtonElement.off(
            'mousedown pointerdown touchstart focus blur'
          );
        }
        bodyElement.off('mouseup pointerup touchend', handleAttachmentUp);
      }
    }

    Object.defineProperties(ctrl, {

      /**
       * Indicates if tile small image is preloading or not.
       *
       * @property smallImagePreloading
       * @type Boolean
       */
      smallImagePreloading: {
        value: false,
        writable: true
      },

      /**
       * Indicates if an error occurred while preloading small image.
       *
       * @property smallImageError
       * @type Boolean
       */
      smallImageError: {
        value: false,
        writable: true
      },

      /**
       * Indicates if tile large image is preloading or not.
       *
       * @property largeImagePreloading
       * @type Boolean
       */
      largeImagePreloading: {
        value: false,
        writable: true
      },

      /**
       * Indicates if tile small image is preloaded or not.
       *
       * @property smallImagePreloaded
       * @type Boolean
       */
      smallImagePreloaded: {
        value: false,
        writable: true
      },

      /**
       * Large image width and height.
       *
       * @property largeImageSize
       * @type Object
       */
      largeImageSize: {
        value: null,
        writable: true
      },

      /**
       * Indicates if an error occurred while preloading large image.
       *
       * @property largeImageError
       * @type Boolean
       */
      largeImageError: {
        value: false,
        writable: true
      },

      /**
       * The tile file name.
       *
       * @property fileName
       * @type String
       */
      fileName: {
        value: null,
        writable: true
      },

      /**
       * Focuses the tile.
       *
       * If tile is enlarged, the close button is automatically focused.
       *
       * @method focus
       */
      focus: {
        value: function() {
          if (!tileElement || !tileElement.length) return;
          if (ctrl.oplAbstract) tileElement[0].focus();
          else if (fullCloseButtonController) fullCloseButtonController.focus();
        }
      },

      /**
       * Indicates if tile is focused or not.
       *
       * @method isFocused
       * @return {Boolean} true if focused, false otherwise
       */
      isFocused: {
        value: function() {
          return tileElement.hasClass('opl-focus');
        }
      },

      /**
       * Preloads small image of the tile (only if type is "image").
       *
       * @method preload
       */
      preload: {
        value: function() {
          if (ctrl.oplData.type === 'image' && !ctrl.smallImagePreloaded) preloadSmallImage();
        }
      },

      /**
       * Gets the tile height.
       *
       * @method getTileHeight
       * @return {Number} The tile height in pixels
       */
      getTileHeight: {
        value: function() {
          return getTitleHeight() + $scope.descriptionHeight + getAttachmentHeight() + 8 * 2;
        }
      },

      /**
       * Resets the tile.
       *
       * @method reset
       */
      reset: {
        value: function() {
          if (!initialized) return;
          if (reseting) {
            resetRequested = true;
            return;
          }

          var waitForElementPromises = [];
          ready = false;
          reseting = true;
          descriptionScrollerReady = ctrl.oplData.description ? false : true;
          tileElement = angular.element($element[0].querySelector('.opl-tile'));

          if (ctrl.oplAbstract)
            waitForElementPromises.push(oplDomFactory.waitForElement($element[0], '.opl-abstract'));
          else
            waitForElementPromises.push(oplDomFactory.waitForElement($element[0], '.opl-full'));

          $q.all(waitForElementPromises).then(function() {
            findElements();
            clearEventListeners();
            setEventListeners();

            if (ctrl.oplData.file) {
              var urlChunks = ctrl.oplData.file.url.match(/.*\/([^#?]*)/);
              ctrl.fileName = urlChunks[1];
            }

            return computeTileHeight();
          }).then(function(height) {
            tileHeight = height;

            var waitForElementControllerPromises = [];

            if (!ctrl.oplAbstract) {
              $scope.descriptionHeight = getDescriptionHeight();

              if (ctrl.oplData.description) {
                var descriptionScrollerPromise =
                    oplDomFactory.waitForController(fullDescriptionScrollerElement[0], 'oplScroller');

                waitForElementControllerPromises.push(descriptionScrollerPromise);
                descriptionScrollerPromise.then(
                  function(controller) {
                    fullDescriptionScrollerController = controller;
                    fullDescriptionScrollerController.reset();
                  }
                );
              }

              if (ctrl.oplData.image) preloadLargeImage();

              var closeButtonPromise = oplDomFactory.waitForController(fullCloseButtonElement[0], 'oplButton');
              waitForElementControllerPromises.push(closeButtonPromise);
              closeButtonPromise.then(
                function(controller) {
                  fullCloseButtonController = controller;
                }
              );

              $q.all(waitForElementControllerPromises).then(function() {
                ready = true;
                reseting = false;
                if (ctrl.oplOnReady && descriptionScrollerReady) ctrl.oplOnReady();

                if (resetRequested) {
                  resetRequested = false;
                  ctrl.reset();
                }
              });
            } else if (ctrl.oplOnReady) {
              ready = true;
              reseting = false;
              if (ctrl.oplOnReady) ctrl.oplOnReady();

              if (resetRequested) {
                resetRequested = false;
                ctrl.reset();
              }
            }
          });

        }
      },

      /**
       * Initializes the component.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          bodyElement = angular.element($window.document.body);
          $scope.descriptionHeight = 0;
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
          ctrl.reset();
        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplData] oplData old and new value
       * @param {String} [changedProperties.oplData.currentValue] oplData new value
       * @param {Object} [changedProperties.oplAbstract] oplAbstract old and new value
       * @param {String} [changedProperties.oplAbstract.currentValue] oplAbstract new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if (changedProperties.oplAbstract && changedProperties.oplAbstract.currentValue !== undefined) {
            $timeout(function() {
              ctrl.reset();
            });
          } else if (changedProperties.oplData && changedProperties.oplData.currentValue) {
            ctrl.reset();
          }
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
      }

    });

    /**
     * Gets HTML string as trusted HTML.
     *
     * @param {String} The HTML string to trust
     */
    $scope.getTrustedHtml = function(html) {
      return $sce.trustAsHtml(html);
    };

    /**
     * Handles "more info" button action.
     */
    $scope.handleMoreInfoAction = function() {
      if (ctrl.oplOnMore) ctrl.oplOnMore({tile: ctrl.oplData});
    };

    /**
     * Handles close button action.
     */
    $scope.handleCloseAction = function() {
      if (ctrl.oplOnClose) ctrl.oplOnClose({tile: ctrl.oplData});
    };

    /**
     * Handles description scroller ready.
     */
    $scope.handleDescriptionScrollerOnReady = function() {
      descriptionScrollerReady = true;
      if (ready && ctrl.oplOnReady) ctrl.oplOnReady();
    };

  }

  app.controller('OplTileController', OplTileController);
  OplTileController.$inject = [
    '$scope',
    '$element',
    '$timeout',
    '$http',
    '$sce',
    '$q',
    '$window',
    'oplDomFactory'
  ];

})(angular.module('ov.player'));
