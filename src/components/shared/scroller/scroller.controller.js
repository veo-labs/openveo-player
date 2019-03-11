'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Manages oplScroller component.
   *
   * @param {Object} $window The AngularJS $window service
   * @param {Object} $scope The component isolated scope
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $timeout AngularJS $timeout service
   * @param {Object} $q AngularJS $q service
   * @param {Object} oplDomFactory Helper to manipulate the DOM
   * @class OplScrollerController
   * @constructor
   */
  function OplScrollerController($window, $scope, $element, $timeout, $q, oplDomFactory) {
    var ctrl = this;
    var thumbElement;
    var contentElement;
    var contentWrapperElement;
    var scrollerElement;
    var scrollbarElement;
    var bodyElement;
    var contentElementBoundingRectangle;
    var containerElementBoundingRectangle;
    var thumbOver;
    var thumbActivated;
    var thumbSize;
    var uiEventThumbPosition;
    var contentSize;
    var containerSize;
    var containerPosition;
    var ngModelCtrl = $element.controller('ngModel');

    $scope.value = 0;

    /**
     * Tests if device is a touch device.
     *
     * @return {Boolean} true if the device is a touch one, false otherwise
     */
    function isTouchDevice() {
      return true == ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
    }

    /**
     * Updates model with actual value.
     */
    function updateModel() {
      ngModelCtrl.$setViewValue($scope.value);
      ngModelCtrl.$validate();
    }

    /**
     * Updates the cursor.
     *
     * Set the position of the cursor using current value.
     * The edge of the cursor varies from 0% to 100% of the content to scroll.
     *
     * Set the size of the cursor regarding the content size and the size of the scroller container.
     * Note that the cursor has a minimum size.
     *
     * If cursor is activated or has a pointer over it, it is enlarged.
     */
    function updateThumb() {
      if (!containerSize || !contentSize) return;

      var percentage = $scope.value / 100;
      var scaleProperty = (ctrl.oplOrientation === 'horizontal') ? 'scaleY' : 'scaleX';
      var translateProperty = (ctrl.oplOrientation === 'horizontal') ? 'translateX' : 'translateY';
      var sizeProperty = (ctrl.oplOrientation === 'horizontal') ? 'width' : 'height';

      thumbSize = 0;

      if (containerSize < contentSize)
        thumbSize = Math.max((containerSize / contentSize) * containerSize, 32);

      thumbElement.attr(
        'style',
        'transform: ' +
        translateProperty + '(' + percentage * (containerSize - thumbSize) + 'px)' +
        ((thumbActivated || thumbOver) ? ' ' + scaleProperty + '(1.5)' : '') +
        '; ' + sizeProperty + ': ' + thumbSize + 'px;'
      );
    }

    /**
     * Updates the scroll.
     *
     * Set the position of the content regarding the scroller value.
     * Scroll varies from 0 to the size of the content.
     */
    function updateScroll() {
      if (!contentSize) return;
      var scrollProperty = (ctrl.oplOrientation === 'horizontal') ? 'scrollLeft' : 'scrollTop';

      if (containerSize < contentSize)
        contentWrapperElement[0][scrollProperty] = ($scope.value * (contentSize - containerSize)) / 100;
    }

    /**
     * Updates scroller with current value.
     */
    function updateScroller() {
      updateThumb();
      updateScroll();
    }

    /**
     * Gets the position of a UI event relative to the page.
     *
     * @param {UIEvent} event Either a MouseEvent, PointerEvent or TouchEvent
     * @return {Number} The position of the UI event relative to the page
     */
    function getUiEventPagePosition(event) {
      var pagePositionProperty = (ctrl.oplOrientation === 'horizontal') ? 'pageX' : 'pageY';
      return event[pagePositionProperty];
    }

    /**
     * Gets the thumb value corresponding to a pointer event.
     *
     * @param {UIEvent} event Either a MouseEvent, PointerEvent or TouchEvent
     * @return {Number} The thumb value corresponding to the event from 0 to 100
     */
    function getValueFromUiEvent(event) {
      var uiEventPagePosition = getUiEventPagePosition(event);
      var thumbPosition = uiEventPagePosition - containerPosition - uiEventThumbPosition;

      return Math.max(0, Math.min(100, thumbPosition / (containerSize - thumbSize) * 100));
    }

    /**
     * Gets the position of a UI event relative to the thumb element.
     *
     * @param {UIEvent} event Either a MouseEvent, PointerEvent or TouchEvent
     * @return {Number} The position of the UI event relative to the thumb element
     */
    function getUiEventPositionOnThumb(event) {
      var uiEventPagePosition = getUiEventPagePosition(event);

      var thumbPosition = ($scope.value * (containerSize - thumbSize)) / 100;
      return uiEventPagePosition - containerPosition - thumbPosition;
    }

    /**
     * Sets scroller value.
     *
     * It also updates the model and the user interface.
     *
     * @param {Number} value The value to apply to the slider between 0 and 100
     * @param {Boolean} [force=false] Force the value even if it hasn't changed
     */
    function setValue(value, force) {
      if (value === $scope.value && !force) return;

      $scope.value = Math.min(100, Math.max(0, value || 0));
      updateModel();
      updateScroller();
    }

    /**
     * Handles content over event.
     *
     * Add over class to the scroller HTML element.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleContentOver(event) {
      if (scrollerElement.hasClass('opl-scroller-over')) return;
      scrollerElement.addClass('opl-scroller-over');
    }

    /**
     * Handles content out event.
     *
     * Remove over class from the scroller HTML element.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleContentOut(event) {
      if (!scrollerElement.hasClass('opl-scroller-over')) return;
      scrollerElement.removeClass('opl-scroller-over');
    }

    /**
     * Handles thumb over event.
     *
     * Sets over class on the thumb HTML element.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleThumbOver(event) {
      if (thumbElement.hasClass('opl-thumb-over')) return;
      thumbElement.addClass('opl-thumb-over');
      thumbOver = true;
      updateThumb();
    }

    /**
     * Handles thumb out event.
     *
     * Removes over class on the thumb HTML element.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleThumbOut(event) {
      if (!thumbElement.hasClass('opl-thumb-over')) return;
      thumbElement.removeClass('opl-thumb-over');
      thumbOver = false;
      updateThumb();
    }

    /**
     * Handles move events.
     *
     * Updates the scroller value as the thumb is moving.
     *
     * @param {UIEvent} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleThumbMove(event) {
      event.preventDefault();
      setValue(getValueFromUiEvent(event));
    }

    /**
     * Handles release events.
     *
     * After releasing, the thumb goes back to its resting state.
     *
     * @param {UIEvent} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleThumbUp(event) {
      event.preventDefault();
      bodyElement.off('mouseup pointerup', handleThumbUp);
      bodyElement.off('mousemove pointermove', handleThumbMove);
      thumbElement.removeClass('opl-thumb-active');
      thumbActivated = false;
      updateThumb();
    }

    /**
     * Handles pressed events.
     *
     * Pressing the thumb will start dragging the thumb.
     * Pressing makes the thumb active.
     *
     * @param {UIEvent} event The captured event which may defer depending on the device (mouse, pen etc.)
     */
    function handleThumbDown(event) {
      if (isTouchDevice()) return;

      event.preventDefault();
      thumbElement.addClass('opl-thumb-active');
      thumbActivated = true;

      if (ctrl.oplOnTouch) ctrl.oplOnTouch();

      uiEventThumbPosition = getUiEventPositionOnThumb(event);
      updateThumb();

      bodyElement.on('mouseup pointerup', handleThumbUp);
      bodyElement.on('mousemove pointermove', handleThumbMove);
    }

    /**
     * Handles resize event.
     *
     * When window is resized, the scroller element may have been resized too.
     * Recalculate the size and position of the thumb.
     *
     * @param {Event} event The captured event
     */
    function handleResize(event) {
      ctrl.reset();
    }

    /**
     * Handles focus event.
     *
     * Add focus class on the scroller HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      scrollerElement.addClass('opl-scroller-focus');
    }

    /**
     * Handles blur event.
     *
     * Remove focus class from the scroller HTML element.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      scrollerElement.removeClass('opl-scroller-focus');
    }

    /**
     * Handles keydown events.
     *
     * Slider captures the following keyboard keys:
     *  - LEFT and RIGHT keys to scroll content if orientation is horizontal
     *  - TOP and BOTTOM keys to scroll content if orientation is vertical
     *  - BEGIN key to set scroller value to 0
     *  - END key to set scroller value to 100
     *
     * Captured keys will prevent default browser actions.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      var value = $scope.value;

      if (
        (ctrl.oplOrientation === 'horizontal' && (event.key === 'ArrowLeft' || event.keyCode === 37)) ||
        (ctrl.oplOrientation === 'vertical' && (event.key === 'ArrowUp' || event.keyCode === 38))
      ) {
        value = Math.max(0, value - (Number(ctrl.oplStep) || 1));
      } else if (
        (ctrl.oplOrientation === 'horizontal' && (event.key === 'ArrowRight' || event.keyCode === 39)) ||
        (ctrl.oplOrientation === 'vertical' && (event.key === 'ArrowDown' || event.keyCode === 40))
      ) {
        value = Math.min(100, value + (Number(ctrl.oplStep) || 1));
      } else if (event.key === 'Home' || event.keyCode === 36) {
        value = 0;
      } else if (event.key === 'End' || event.keyCode === 35) {
        value = 100;
      } else return;

      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
      if (ctrl.oplOnTouch) ctrl.oplOnTouch();
      setValue(value);
    }

    /**
     * Handles wheel events.
     *
     * Scroll the content and prevent default browser action.
     *
     * @param {WheelEvent} event The captured event
     */
    function handleWheel(event) {
      var scrollValue = ctrl.getScrollValue();
      scrollValue += event.deltaY;

      event.preventDefault();

      if (ctrl.oplOnTouch) ctrl.oplOnTouch();
      ctrl.setScrollValue(scrollValue);
    }

    /**
     * Sets event listeners on HTML elements of the scroller component.
     */
    function setEventListeners() {
      scrollbarElement.on('keydown', handleKeyDown);
      scrollbarElement.on('focus', handleFocus);
      scrollbarElement.on('blur', handleBlur);

      scrollerElement.on('mouseover pointerover', handleContentOver);
      scrollerElement.on('mouseout pointerout', handleContentOut);
      scrollerElement.on('wheel', handleWheel);

      thumbElement.on('mousedown pointerdown', handleThumbDown);
      thumbElement.on('mouseover pointerover', handleThumbOver);
      thumbElement.on('mouseout pointerout', handleThumbOut);

      angular.element($window).on('resize', handleResize);
    }

    /**
     * Removes event listeners set with setEventListeners.
     */
    function clearEventListeners() {
      scrollbarElement.off('keydown', handleKeyDown);
      scrollbarElement.off('focus', handleFocus);
      scrollbarElement.off('blur', handleBlur);

      scrollerElement.off('mouseover pointerover', handleContentOver);
      scrollerElement.off('mouseout pointerout', handleContentOut);
      scrollerElement.off('wheel', handleWheel);

      thumbElement.off('mousedown pointerdown', handleThumbDown);
      thumbElement.off('mouseover pointerover', handleThumbOver);
      thumbElement.off('mouseout pointerout', handleThumbOut);

      bodyElement.off('mouseup pointerup', handleThumbUp);
      bodyElement.off('mousemove pointermove', handleThumbMove);

      angular.element($window).off('resize', handleResize);
    }

    Object.defineProperties(ctrl, {

      /**
       * Focuses the scroller.
       *
       * @method focus
       */
      focus: {
        value: function() {
          scrollbarElement[0].focus();
        }
      },

      /**
       * Indicates if scroller is focused or not.
       *
       * @method isFocused
       * @return {Boolean} true if focused, false otherwise
       */
      isFocused: {
        value: function() {
          return scrollerElement.hasClass('opl-scroller-focus');
        }
      },

      /**
       * Gets scroller value.
       *
       * @method getScrollValue
       * @return {Number} The scroll value applied to the container in pixels
       */
      getScrollValue: {
        value: function() {
          var scrollProperty = (ctrl.oplOrientation === 'horizontal') ? 'scrollLeft' : 'scrollTop';
          return contentWrapperElement[0][scrollProperty];
        }
      },

      /**
       * Sets scroller value using pixels instead of percentage.
       *
       * @method setScrollValue
       * @param {Number} The scroll value to apply to the container in pixels
       */
      setScrollValue: {
        value: function(value) {
          if (!contentSize || !containerSize) return;
          setValue((value / (contentSize - containerSize)) * 100);
        }
      },

      /**
       * Gets the scrolled content size.
       *
       * @method getContentSize
       * @return {Number} The content size in pixels
       */
      getContentSize: {
        value: function() {
          return contentSize;
        }
      },

      /**
       * Initializes the component.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          contentWrapperElement = angular.element($element[0].querySelector('.opl-scroller-content'));
          bodyElement = angular.element($window.document.body);
          scrollerElement = angular.element($element[0].querySelector('.opl-scroller'));
          scrollbarElement = angular.element($element[0].querySelector('.opl-scrollbar'));
          thumbElement = angular.element($element[0].querySelector('.opl-thumb'));

          if (isTouchDevice()) {
            var overflowProperty = (ctrl.oplOrientation === 'horizontal') ? 'overflow-x' : 'overflow-y';
            contentWrapperElement.attr('style', overflowProperty + ': scroll;');
          }
        }
      },

      /**
       * Initializes child components.
       *
       * @method $postLink
       */
      $postLink: {
        value: function() {

          // Wait for child components
          $timeout(function() {
            ctrl.reset();
          });

        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplDeactivated] oplDeactivated old and new value
       * @param {String} [changedProperties.oplDeactivated.currentValue] oplDeactivated new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if (changedProperties.oplDeactivated) {
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
      },

      /**
       * Resets scroller.
       *
       * It calculates the content size, calculates the thumb size and sets value to 0.
       *
       * @method reset
       */
      reset: {
        value: function() {
          if (isTouchDevice() || !scrollerElement) return;
          var waitForElementDimensionPromises = [];

          contentElement = angular.element($element[0].querySelector('.opl-scroller-content > div'));

          var contentElementPromise = oplDomFactory.waitForElementDimension(contentElement[0], [
            {
              property: 'width',
              notEqual: 0
            },
            {
              property: 'height',
              notEqual: 0
            }
          ]);
          waitForElementDimensionPromises.push(contentElementPromise);
          contentElementPromise.then(function(boundingRectangle) {
            contentElementBoundingRectangle = boundingRectangle;
          });

          var containerElementPromise = oplDomFactory.waitForElementDimension(contentWrapperElement[0], [
            {
              property: 'width',
              notEqual: 0
            },
            {
              property: 'height',
              notEqual: 0
            }
          ]);
          waitForElementDimensionPromises.push(containerElementPromise);
          containerElementPromise.then(function(boundingRectangle) {
            containerElementBoundingRectangle = boundingRectangle;
          });

          $q.all(waitForElementDimensionPromises).then(function() {
            if (containerElementBoundingRectangle) {
              var containerLeftPosition = containerElementBoundingRectangle.left;
              var containerTopPosition = containerElementBoundingRectangle.top;
              var containerWidth = containerElementBoundingRectangle.width;
              var containerHeight = containerElementBoundingRectangle.height;
              containerSize = (ctrl.oplOrientation === 'horizontal') ? containerWidth : containerHeight;
              containerPosition = (ctrl.oplOrientation === 'horizontal') ? containerLeftPosition : containerTopPosition;
            }

            if (contentElementBoundingRectangle) {
              var contentWidth = contentElementBoundingRectangle.width;
              var contentHeight = contentElementBoundingRectangle.height;
              contentSize = (ctrl.oplOrientation === 'horizontal') ? contentWidth : contentHeight;
            }

            clearEventListeners();

            if (ctrl.oplDeactivated) return;

            setEventListeners();

            updateThumb();
            setValue($scope.value, true);

            if (ctrl.oplOnReady) ctrl.oplOnReady();
          });
        }
      }

    });

    /**
     * Updates the scroller value from model.
     *
     * It overrides AngularJS $render.
     */
    ngModelCtrl.$render = function() {
      setValue(ngModelCtrl.$viewValue, true);
    };

    /**
     * Tests if the model is empty.
     *
     * It overrides AngularJS $isEmpty. The model value can't be empty.
     *
     * @param {Number} value The model value
     * @return {Boolean} false as the model can't by empty
     */
    ngModelCtrl.$isEmpty = function(value) {
      return false;
    };

  }

  app.controller('OplScrollerController', OplScrollerController);
  OplScrollerController.$inject = [
    '$window',
    '$scope',
    '$element',
    '$timeout',
    '$q',
    'oplDomFactory'
  ];

})(angular.module('ov.player'));
