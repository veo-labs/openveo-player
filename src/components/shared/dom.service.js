'use strict';

/**
 * @module ov.player
 */

(function(app) {

  /**
   * Helps manipulate the DOM.
   *
   * @param {Object} $q The AngularJS $q service
   * @param {Object} $timeout The AngularJS $timeout service
   * @class OplDomFactory
   * @constructor
   */
  function OplDomFactory($q, $timeout) {

    /**
     * Waits for something to be valid.
     *
     * @param {Function} isValid A function to call to test the validity, if it returns true the promise is
     * resolved, if it returns false the function waits and call the function again later
     * @param {Number} [timeout=50] The maximum number of milliseconds to wait for it to be valid before rejecting
     * the promise
     * @return {Promise} A promise resolving when valid
     * @method wait
     */
    function wait(isValid, timeout) {
      if (!timeout) timeout = 50;
      var deferred = $q.defer();
      var waitPromise = null;

      var waitToBeValid = function() {
        if (isValid()) return $q.when();
        var validDeferred = $q.defer();

        waitPromise = $timeout(function() {
          if (isValid()) return validDeferred.resolve();

          waitToBeValid().then(function() {
            validDeferred.resolve();
          }).catch(function(reason) {
            validDeferred.reject(reason);
          });
        }, 10);

        return validDeferred.promise;
      };

      $q.race([
        $timeout(function() {
          return 0;
        }, timeout),
        waitToBeValid()
      ]).then(function(result) {
        if (result === 0) {

          // Timeout
          deferred.reject('Timed out');

        } else {
          deferred.resolve();
        }

      }).catch(function(reason) {
        deferred.reject(reason);
      }).finally(function() {
        if (waitPromise) $timeout.cancel(waitPromise);
      });

      return deferred.promise;
    }

    /**
     * Waits for a controller associated to an HTML element.
     *
     * @param {HTMLElement} element The HTML element
     * @param {String} componentName The AngularJS compoment name
     * @param {Number} [timeout=500] The maximum number of milliseconds to wait for the element controller
     * @return {Promise} A promise resolving when the controller is available
     * @method waitForController
     */
    function waitForController(element, componentName, timeout) {
      if (!timeout) timeout = 50;
      if (!element) return $q.reject('Element not specified');
      var deferred = $q.defer();
      var controller = null;

      var isControllerReady = function() {
        controller = angular.element(element).controller(componentName);
        return controller ? true : false;
      };

      wait(isControllerReady, timeout).then(function() {
        deferred.resolve(controller);
      }).catch(function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }

    /**
     * Waits for an HTML element being repainted by the browser.
     *
     * @param {HTMLElement} element The HTML element to wait for
     * @param {Array} validators The list of property validators to wait for. Each validator is a description object
     * with:
     *   - [String] property The name of the property concerned by the validator (either "bottom", "top", "width",
     *     "height", "left" or "top")
     *   - [Number] [notEqual] A value the property should not be equal to
     *   - [Number] [equal] A value the property should be equal to
     * @param {Number} [timeout=500] The maximum number of milliseconds to wait for the element to be ready
     * @return {Promise} A promise resolving when the element is ready
     * @method waitForElementDimension
     */
    function waitForElementDimension(element, validators, timeout) {
      if (!timeout) timeout = 50;
      if (!element) return $q.reject('Element not specified');
      var deferred = $q.defer();
      var elementBoundingRectangle = null;

      var isElementReady = function() {
        var boundingRectangle = element.getBoundingClientRect();

        elementBoundingRectangle = {
          bottom: boundingRectangle.bottom,
          height: boundingRectangle.height,
          left: boundingRectangle.left,
          right: boundingRectangle.right,
          top: boundingRectangle.top,
          width: boundingRectangle.width,
          clientWidth: element.clientWidth,
          clientHeight: element.clientHeight
        };

        for (var i = 0; i < validators.length; i++) {
          var validator = validators[i];

          if (
            (
              validator.notEqual !== undefined &&
              elementBoundingRectangle[validator.property] === validator.notEqual
            ) ||
            (
              validator.equal !== undefined &&
              elementBoundingRectangle[validator.property] !== validator.equal
            )
          ) {
            return false;
          }
        }

        return true;
      };

      wait(isElementReady, timeout).then(function() {
        deferred.resolve(elementBoundingRectangle);
      }).catch(function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }

    /**
     * Waits for an HTML element to be present in the DOM.
     *
     * @param {HTMLElement} parentElement A parent element of the expected HTML element
     * @param {String} selector The query selector to select the element from parentElement
     * @param {Number} [timeout=500] The maximum number of milliseconds to wait for the element
     * @return {Promise} A promise resolving when the element is added to the DOM
     * @method waitForElement
     */
    function waitForElement(parentElement, selector, timeout) {
      if (!timeout) timeout = 50;
      if (!parentElement || !selector) return $q.reject('Parent element or selector not specified');
      var deferred = $q.defer();

      var isElementPresent = function() {
        return parentElement.querySelector(selector) ? true : false;
      };

      wait(isElementPresent, timeout).then(function() {
        deferred.resolve();
      }).catch(function(reason) {
        deferred.reject(reason);
      });

      return deferred.promise;
    }

    return {
      waitForElement: waitForElement,
      waitForElementDimension: waitForElementDimension,
      waitForController: waitForController
    };

  }

  app.factory('oplDomFactory', OplDomFactory);
  OplDomFactory.$inject = ['$q', '$timeout'];

})(angular.module('ov.player'));
