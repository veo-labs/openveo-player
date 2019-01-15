'use strict';

/**
 * @module ov.player
 */

(function(app) {

  var TEMPLATES = {
    FULL_1: 'split_1',
    SPLIT_50_50: 'split_50_50',
    SPLIT_25_75: 'split_25_75',
    FULL_2: 'split_2'
  };

  /**
   * Manages oplTemplateSelector component.
   *
   * @param {Object} $element The HTML element holding the component
   * @param {Object} $scope Component isolated scope
   * @param {Object} $timeout AngularJS $timeout service
   * @param {Object} $filter AngularJS $filter service
   * @param {Object} $q AngularJS $q service
   * @param {Object} $window AngularJS $window service
   * @class OplTemplateSelectorController
   * @constructor
   */
  function OplTemplateSelectorController($element, $scope, $timeout, $filter, $q, $window) {
    var ctrl = this;
    var bodyElement;
    var templateSelectorElement;
    var templateElements;
    var maskingRequested = false;
    var selectingAnimationRunning = false;
    var postingAnimationRunning = false;
    var maskingAnimationRunning = false;
    var keepFocus = false;
    var leavingAsked = false;
    var templateFocused = false;
    var previousKeyNavigation = false;
    var orderedTemplates = [];
    var templates = [
      {
        id: TEMPLATES.SPLIT_50_50,
        label: $filter('oplTranslate')('CONTROLS_TEMPLATE_SPLIT_50_50_ARIA_LABEL'),
        hidden: true
      },
      {
        id: TEMPLATES.FULL_1,
        label: $filter('oplTranslate')('CONTROLS_TEMPLATE_FULL_1_ARIA_LABEL'),
        hidden: true
      },
      {
        id: TEMPLATES.FULL_2,
        label: $filter('oplTranslate')('CONTROLS_TEMPLATE_FULL_2_ARIA_LABEL'),
        hidden: true
      },
      {
        id: TEMPLATES.SPLIT_25_75,
        label: $filter('oplTranslate')('CONTROLS_TEMPLATE_SPLIT_25_75_ARIA_LABEL'),
        hidden: true
      }
    ];

    $scope.selectedTemplate = TEMPLATES.SPLIT_50_50;
    $scope.templates = templates;

    /**
     * Finds a template element by template name.
     *
     * @param {String} template The name of the template (from templates variable)
     * @return {HTMLElement} The template element or null if not found
     */
    function findTemplateElement(template) {
      if (!templateElements) return null;

      for (var i = 0; i < templateElements.length; i++) {
        if (angular.element(templateElements[i]).attr('data-id') === template)
          return templateElements[i];
      }
      return null;
    }

    /**
     * Sets a template as displayed.
     *
     * @param {String} template The name of the template (from templates variable) to display
     */
    function setTemplateAsDisplayed(template) {
      templates.forEach(function(TEMPLATE) {
        if (TEMPLATE.id === template) TEMPLATE.hidden = false;
      });
    }

    /**
     * Sets a template as hidden.
     *
     * @param {String} templateName The name of the template (from templates variable) to hide
     */
    function setTemplateAsHidden(templateName) {
      templates.forEach(function(template) {
        if (template.id === templateName) template.hidden = true;
      });
    }

    /**
     * Resets template elements to their initial positions.
     */
    function resetTemplateElementsPositions() {
      orderedTemplates.forEach(function(template) {
        var templateElement = findTemplateElement(template);
        if (!templateElement) return;
        templateElement = angular.element(templateElement);

        if (angular.element(templateElement[0]).attr('data-id') === $scope.selectedTemplate) {
          templateElement.attr(
            'style',
            'opacity: 1; transform: translateX(0px);'
          );
          setTemplateAsDisplayed(angular.element(templateElement).attr('data-id'));
        } else {
          templateElement.attr(
            'style',
            'opacity: 0; transform: translateX(0px);'
          );
          setTemplateAsHidden(angular.element(templateElement).attr('data-id'));
        }
      });
    }

    /**
     * Reorders templates regarding selected template.
     *
     * The order of templates is the same as the templates variable expect that the selected template is placed in
     * index 0.
     */
    function reorderTemplates() {
      orderedTemplates.splice(0, orderedTemplates.length);

      templates.forEach(function(template) {
        if (template.id !== $scope.selectedTemplate)
          orderedTemplates.push(template.id);
      });

      orderedTemplates.unshift($scope.selectedTemplate);
    }

    /**
     * Builds cross-browsers CSS inline code for a transition.
     *
     * @param {String} properties CSS transition-property value
     * @param {String} timingFunctions CSS transition-timing-function value
     * @param {String} durations CSS transition-duration value
     * @return {String} The CSS inline code
     */
    function buildInlineCssTransition(properties, timingFunctions, durations) {
      return 'transition-property: ' + properties + ';' +
        '-moz-transition-property: ' + properties + ';' +
        '-o-transition-property: ' + properties + ';' +
        '-webkit-transition-property: ' + properties + ';' +
        'transition-timing-function: ' + timingFunctions + ';' +
        '-moz-transition-timing-function: ' + timingFunctions + ';' +
        '-o-transition-timing-function: ' + timingFunctions + ';' +
        '-webkit-transition-timing-function: ' + timingFunctions + ';' +
        'transition-duration: ' + durations + ';' +
        '-moz-transition-duration: ' + durations + ';' +
        '-o-transition-duration: ' + durations + ';' +
        '-webkit-transition-duration: ' + durations + ';';
    }

    /**
     * Animates deactivation of a template.
     *
     * Deactivation is performed only if activation activation is ended.
     *
     * @param {String} template The name of the template to deactivate (from templates variable)
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTemplateDeactivation(template) {
      var templateElement = findTemplateElement(template);
      if (!templateElement.deactivationAnimationRequested || templateElement.activationTimer) return $q.when();
      var deferred = $q.defer();

      templateElement.deactivationAnimationRequested = false;
      templateElement.activated = false;
      angular.element(templateElement).removeClass('opl-template-activation');

      // Start deactivation animation
      angular.element(templateElement).addClass('opl-template-deactivation');

      // An animation is associated to the opl-template-deactivation class, wait for it to finish before removing the
      // deactivation class
      // Delay corresponds to the animation duration
      templateElement.deactivationTimer = $timeout(function() {
        angular.element(templateElement).removeClass('opl-template-deactivation');
        deferred.resolve();
      }, 150);

      return deferred.promise;
    }

    /**
     * Animates activation of a template.
     *
     * @param {String} template The name of the template to activate (from templates variable)
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTemplateActivation(template) {
      var deferred = $q.defer();
      var templateElement = findTemplateElement(template);

      // Remove any ongoing activation / deactivation animations
      angular.element(templateElement).removeClass('opl-template-deactivation');
      if (templateElement.activationTimer) $timeout.cancel(templateElement.activationTimer);
      if (templateElement.deactivationTimer) $timeout.cancel(templateElement.deactivationTimer);

      // Start activation animation
      angular.element(templateElement).addClass('opl-template-activation');

      // Animation is associated to the opl-template-activation class, wait for it to finish before running the
      // deactivation animation.
      // Delay corresponds to the animation duration
      templateElement.activationTimer = $timeout(function() {
        templateElement.activationTimer = null;
        requestAnimationFrame(function() {
          animateTemplateDeactivation(angular.element(templateElement).attr('data-id')).then(function() {
            deferred.resolve();
          });
        });
      }, 225);

      return deferred.promise;
    }

    /**
     * Animates posting of the list of templates.
     *
     * The animation consists of a transition coupled with a resolve effect to display hidden templates.
     * The selected template is not animated.
     * Each template is animated independently.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTemplatesPosting() {
      if (postingAnimationRunning || templateSelectorElement.hasClass('opl-posted')) return $q.when();
      var deferred = $q.defer();
      var count = 0;
      var animationCount = 0;

      postingAnimationRunning = true;
      orderedTemplates.forEach(function(template) {
        var templateElement = findTemplateElement(template);
        if (!templateElement) return;
        templateElement = angular.element(templateElement);

        if (templateElement.attr('data-id') === $scope.selectedTemplate) return;

        // Move template along the x-axis and change its opacity
        // The template is 32px wide
        // Transition properties are set in here because the browser can't both set a class and change the inline style
        // of the element, it doesn't work all the time.
        templateElement.attr(
          'style',
          buildInlineCssTransition(
            'transform, opacity',
            'cubic-bezier(0.4, 0, 0.2, 1), cubic-bezier(0.4, 0, 0.2, 1)',
            '150ms, 150ms'
          ) +
          'opacity: 0.60;' +
          'transform: translateX(-' + (++count * 32) + 'px);'
        );

        templateElement.on('transitionend', function() {
          templateElement.off('transitionend');
          setTemplateAsDisplayed(templateElement.attr('data-id'));

          if (++animationCount === orderedTemplates.length - 1) {
            templateSelectorElement.addClass('opl-posted');
            postingAnimationRunning = false;
            $scope.$apply();
            deferred.resolve();
          }
        });
      });

      return deferred.promise;
    }

    /**
     * Animates masking of the list of templates.
     *
     * The animation consists of the exact opposite of the posting animation.
     * The selected template is not animated.
     * Each template is animated independently.
     *
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTemplatesMasking() {
      if (maskingAnimationRunning || (!templateSelectorElement.hasClass('opl-posted'))) return $q.when();
      var deferred = $q.defer();
      var animationCount = 0;

      maskingAnimationRunning = true;
      orderedTemplates.forEach(function(template) {
        var templateElement = findTemplateElement(template);
        if (!templateElement) return;
        templateElement = angular.element(templateElement);

        if (templateElement.attr('data-id') === $scope.selectedTemplate) return;

        // Move template along the x-axis and change its opacity
        // The template is 32px wide
        // Transition properties are set in here because the browser can't both set a class and change the inline style
        // of the element, it doesn't work all the time.
        templateElement.attr(
          'style',
          buildInlineCssTransition('transform, opacity', 'linear, linear', '75ms, 75ms') +
          'opacity: 0;' +
          'transform: translateX(0);'
        );

        templateElement.on('transitionend', function() {
          templateElement.off('transitionend');
          setTemplateAsHidden(templateElement.attr('data-id'));

          if (++animationCount === orderedTemplates.length - 1) {
            templateSelectorElement.removeClass('opl-posted');
            maskingAnimationRunning = false;
            $scope.$apply();
            deferred.resolve();
          }
        });
      });

      return deferred.promise;
    }

    /**
     * Animates the selecting of a template.
     *
     * The animation is different for the new selected template and other templates:
     *   - selected template: The animation consists of a transition coupled with full opacity effect to set the
     *     template as the new selected one
     *   - other templates: The animation consists of a transition coupled with a dissolve effect to hide the templates
     * Each template is animated independently.
     *
     * @param {String} oldTemplate The old selected template
     * @param {String} newTemplate The new selected template
     * @return {Promise} Promise resolving when animation is finished
     */
    function animateTemplateSelecting(oldTemplate, newTemplate) {
      if (selectingAnimationRunning || !templateSelectorElement.hasClass('opl-posted')) return $q.when();
      var deferred = $q.defer();
      var count = 0;
      var animationCount = 0;
      selectingAnimationRunning = true;

      orderedTemplates.forEach(function(template) {
        var templateElement = findTemplateElement(template);
        if (!templateElement) return;
        templateElement = angular.element(templateElement);
        if (templateElement.attr('data-id') === newTemplate) {

          // Selected template
          // Move template along the x-axis to its initial position and set full opacity
          // Transition properties are set in here because the browser can't both set a class and change the inline
          // style of the element, it doesn't work all the time.
          templateElement.attr(
            'style',
            buildInlineCssTransition('transform, opacity', 'linear, linear', '150ms, 150ms') +
            'opacity: 1;' +
            'transform: translateX(0);'
          );

        } else {

          // Other templates
          // Move template along the y-axis and make it disappear
          // Transition properties are set in here because the browser can't both set a class and change the inline
          // style of the element, it doesn't work all the time.
          templateElement.attr(
            'style',
            buildInlineCssTransition('transform, opacity', 'linear, linear', '50ms, 50ms') +
            'opacity: 0;' +
            'transform: translateX(-' + (count * 32) + 'px) translateY(32px);'
          );

        }

        count++;

        templateElement.on('transitionend', function() {
          templateElement.off('transitionend');
          if (templateElement.attr('data-id') === newTemplate)
            setTemplateAsDisplayed(templateElement.attr('data-id'));
          else
            setTemplateAsHidden(templateElement.attr('data-id'));

          if (++animationCount === orderedTemplates.length) {
            templateSelectorElement.removeClass('opl-posted');
            selectingAnimationRunning = false;
            $scope.$apply();
            deferred.resolve();
          }
        });
      });

      return deferred.promise;
    }

    /**
     * Focuses a template element.
     *
     * @param {String} template The name of the template to focus (from templates variable)
     */
    function focusTemplate(template) {
      for (var i = 0; i < templateElements.length; i++) {
        if (angular.element(templateElements[i]).attr('data-id') === template) {
          templateElements[i].focus();
          break;
        }
      }
    }

    /**
     * Removes focus class to template elements.
     */
    function unfocusTemplates() {
      templateElements.forEach(function(templateElement) {
        angular.element(templateElement).removeClass('opl-template-focus');
      });
    }

    /**
     * Focus previous/next template based on focused template.
     *
     * @param {Boolean} next true to focus next template, false to focus previous template
     */
    function focusSiblingTemplate(next) {

      // Find focused template
      var focusedTemplate;
      for (var i = 0; i < templateElements.length; i++) {
        if (angular.element(templateElements[i]).hasClass('opl-template-focus')) {
          focusedTemplate = angular.element(templateElements[i]).attr('data-id');
          break;
        }
      }

      // Find focused template index from the ordered list of templates
      var focusedTemplateIndex = orderedTemplates.indexOf(focusedTemplate);
      var siblingTemplateIndex = next ? focusedTemplateIndex + 1 : focusedTemplateIndex - 1;

      if (siblingTemplateIndex >= orderedTemplates.length) siblingTemplateIndex = 0;
      if (siblingTemplateIndex < 0) siblingTemplateIndex = orderedTemplates.length - 1;

      focusTemplate(orderedTemplates[siblingTemplateIndex]);
    }

    /**
     * Focuses the component.
     *
     * It does not set the browser focus on the template selector element but on the selected template element.
     * It adds a class to the template selector element and display the list of templates.
     */
    function focus() {
      templateSelectorElement.addClass('opl-focus');
      focusTemplate($scope.selectedTemplate);

      requestAnimationFrame(function() {
        animateTemplatesPosting();
      });
      if (ctrl.oplOnFocus) ctrl.oplOnFocus();
    }

    /**
     * Unfocuses the component.
     *
     * It removes focus classes from the component and its templates.
     * It also masks the list of templates.
     */
    function unfocus() {
      templateSelectorElement.removeClass('opl-focus');
      unfocusTemplates();

      requestAnimationFrame(function() {
        animateTemplatesMasking();
      });
    }

    /**
     * Calls the oplOnUpdate function with the given template.
     *
     * @param {String} template The chosen template
     */
    function callAction(template) {
      if (ctrl.oplOnUpdate && template !== $scope.selectedTemplate) ctrl.oplOnUpdate({template: template});
    }

    /**
     * Handles keydown events.
     *
     * Toggle button captures the following keyboard keys:
     *  - LEFT and BOTTOM keys to focus previous template
     *  - RIGHT and TOP keys to focus next template
     *  - ENTER to validate a template
     *  - TAB to unfocus the component
     *
     * Captured keys will prevent default browser actions except for TAB key.
     *
     * @param {KeyboardEvent} event The captured event
     */
    function handleKeyDown(event) {
      if (((event.key === 'ArrowLeft' || event.keyCode === 37) ||
          (event.key === 'ArrowDown' || event.keyCode === 40)) && !selectingAnimationRunning
      ) {
        requestAnimationFrame(function() {
          animateTemplatesPosting();
        });
        focusSiblingTemplate(true);
      } else if (((event.key === 'ArrowUp' || event.keyCode === 38) ||
          (event.key === 'ArrowRight' || event.keyCode === 39)) && !selectingAnimationRunning
      ) {
        requestAnimationFrame(function() {
          animateTemplatesPosting();
        });
        focusSiblingTemplate(false);
      } else if (event.key === 'Enter' || event.keyCode === 13) {
        $scope.$apply(function() {
          callAction(angular.element(event.target).attr('data-id'));
        });
      } else if (event.key === 'Tab' || event.keyCode === 9) {
        keepFocus = false;
        leavingAsked = true;
        previousKeyNavigation = event.shiftKey ? true : false;

        if (previousKeyNavigation && templateFocused) {

          // Left navigation is performed
          // A template is focused
          // The template selector is going to be focused and should keep the focus (not giving it back to the
          // template)
          keepFocus = true;

        }

        return;
      } else return;

      event.preventDefault();
    }

    /**
     * Handles focus event.
     *
     * The template selector element has been focused.
     * When template selector is focused, it can be that:
     *   - the focus is coming from the selected template
     *   - the focus is coming from an external element
     *
     * @param {FocusEvent} event The captured event
     */
    function handleFocus(event) {
      if (keepFocus) {
        keepFocus = false;
      } else {
        keepFocus = true;
        focus();
      }
    }

    /**
     * Handles blur event.
     *
     * The template selector element has been unfocused.
     * When template selector is unfocused, it can be that:
     *   - the focus is going to the selected template
     *   - the focus is going out to an external element
     *
     * @param {FocusEvent} event The captured event
     */
    function handleBlur(event) {
      if (!keepFocus) {
        unfocus();
        leavingAsked = false;
      }
    }

    /**
     * Handles focus event.
     *
     * The template element has been focused.
     * When template is focused, the focus comes from the template selector.
     *
     * @param {FocusEvent} event The captured event
     */
    function handleTemplateFocus(event) {
      angular.element(event.target).addClass('opl-template-focus');
      templateFocused = true;
    }

    /**
     * Handles templates blur event.
     *
     * The template has been unfocused.
     * When template is unfocused, it can be that:
     *   - the focus is going to another template
     *   - the focus is going to the template selector
     *   - the focus is going out to another element
     *
     * @param {FocusEvent} event The captured event
     */
    function handleTemplateBlur(event) {
      if (previousKeyNavigation === false && leavingAsked) {
        keepFocus = false;
        leavingAsked = false;
        unfocus();
      }

      templateFocused = false;
      angular.element(event.target).removeClass('opl-template-focus');
    }

    /**
     * Handles over event.
     *
     * Displays the list of templates.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleOver(event) {
      if (selectingAnimationRunning) return;

      maskingRequested = false;
      requestAnimationFrame(function() {
        animateTemplatesPosting();
      });
    }

    /**
     * Handles out event.
     *
     * Hides the list of templates.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleOut(event) {
      if (selectingAnimationRunning) return;

      // As template buttons are computed outside the templateSelector main HTML element (position absolute), an "over"
      // and an "out" event will be dispatched each time the pointer leaves and enters a new template button.
      // To avoid executing the animateTemplatesMasking function too many times, we wait for the next loop to be sure
      // that no "over" event has been dispatched just after the "out" event.
      // On the next loop, if maskingRequested is still set to "true" then the animateTemplatesMasking function is
      // called.
      maskingRequested = true;
      $timeout(function() {
        if (!maskingRequested) return;

        requestAnimationFrame(function() {
          animateTemplatesMasking();
        });
      });
    }

    /**
     * Handles release events.
     *
     * Deactivates template. After releasing, template is not longer active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleUp(event) {
      if (selectingAnimationRunning) return;

      // Find template element from event. The event can come from the template icon or the template itself.
      var templateElement = (!angular.element(event.target).attr('data-id')) ? event.target.parentNode : event.target;

      bodyElement.off('mouseup pointerup touchend', handleUp);

      templateElements.forEach(function(templateElement) {
        requestAnimationFrame(function() {
          templateElement.deactivationAnimationRequested = true;
          animateTemplateDeactivation(angular.element(templateElement).attr('data-id'));
        });
        templateElement.activated = false;
      });
      callAction(angular.element(templateElement).attr('data-id'));
    }

    /**
     * Handles pressed events.
     *
     * Activates template. Pressing the template makes it active.
     *
     * @param {Event} event The captured event which may defer depending on the device (mouse, touchpad, pen etc.)
     */
    function handleDown(event) {
      if (selectingAnimationRunning) return;

      // Find template element from event. The event can come from the template icon or the template itself.
      var templateElement = (!angular.element(event.target).attr('data-id')) ? event.target.parentNode : event.target;

      if (templateElement.activated) return;

      templateElement.activated = true;
      bodyElement.on('mouseup pointerup touchend', handleUp);
      requestAnimationFrame(function() {
        animateTemplateActivation(angular.element(templateElement).attr('data-id'));
      });
    }

    Object.defineProperties(ctrl, {

      /**
       * The available list of templates.
       *
       * @property TEMPLATES
       * @type Object
       */
      TEMPLATES: {
        value: TEMPLATES
      },

      /**
       * Initializes controller.
       *
       * @method $onInit
       */
      $onInit: {
        value: function() {
          bodyElement = angular.element($window.document.body);
          templateSelectorElement = angular.element($element[0].querySelector('.opl-template-selector'));

          // Associate template elements to corresponding template type
          $timeout(function() {
            templateElements = $element[0].querySelectorAll('button');
            resetTemplateElementsPositions();

            angular.element(templateElements).on('focus', handleTemplateFocus);
            angular.element(templateElements).on('blur', handleTemplateBlur);
          });

          // Careful: handleOver and handleOut are called twice on some devices, one with a pointer event and one with
          // a mouse event.
          templateSelectorElement.on('keydown', handleKeyDown);
          templateSelectorElement.on('focus', handleFocus);
          templateSelectorElement.on('blur', handleBlur);
          templateSelectorElement.on('mouseover pointerover', handleOver);
          templateSelectorElement.on('mouseout pointerout', handleOut);
          templateSelectorElement.on('mousedown pointerdown touchstart', handleDown);
        }
      },

      /**
       * Removes event listeners.
       *
       * @method $onDestroy
       */
      $onDestroy: {
        value: function() {
          templateSelectorElement.off(
            'keydown focus blur mouseover pointerover mouseout pointerout mousedown pointerdown touchstart'
          );
          if (templateElements) angular.element(templateElements).off('focus blur');
          bodyElement.off('mouseup pointerup touchend', handleUp);
        }
      },

      /**
       * Handles one-way binding properties changes.
       *
       * @method $onChanges
       * @param {Object} changedProperties Properties which have changed since last digest loop
       * @param {Object} [changedProperties.oplTemplate] oplTemplate old and new value
       * @param {String} [changedProperties.oplTemplate.currentValue] oplTemplate new value
       */
      $onChanges: {
        value: function(changedProperties) {
          if (changedProperties.oplTemplate && changedProperties.oplTemplate.currentValue) {
            var newTemplateIndex;
            var oldTemplate = $scope.selectedTemplate;

            // Find new template in the list of templates
            for (newTemplateIndex = 0; newTemplateIndex < templates.length; newTemplateIndex++) {
              if (changedProperties.oplTemplate.currentValue === templates[newTemplateIndex].id) break;
            }
            $scope.selectedTemplate =
              (newTemplateIndex === -1) ? templates[0].id : changedProperties.oplTemplate.currentValue;

            if (templateSelectorElement && templateSelectorElement.hasClass('opl-posted')) {
              animateTemplateSelecting(oldTemplate, $scope.selectedTemplate).then(function() {
                resetTemplateElementsPositions();
                reorderTemplates();
                focusTemplate($scope.selectedTemplate);
              });
            } else {

              // Reorder templates
              reorderTemplates();
              resetTemplateElementsPositions();

            }
          }
        }
      }
    });

  }

  app.controller('OplTemplateSelectorController', OplTemplateSelectorController);
  OplTemplateSelectorController.$inject = ['$element', '$scope', '$timeout', '$filter', '$q', '$window'];

})(angular.module('ov.player'));
