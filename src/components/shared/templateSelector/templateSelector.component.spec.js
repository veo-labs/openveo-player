'use strict';

window.assert = chai.assert;

describe('OplTemplateSelector', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var oplEventsFactory;
  var scope;
  var originalRequestAnimationFrame;

  // Load modules
  beforeEach(function() {
    module('ov.player');
    module('templates');

    // Mock requestAnimationFrame
    originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      callback();
    };
  });

  afterEach(function() {
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$document_, _oplEventsFactory_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $document = _$document_;
    oplEventsFactory = _oplEventsFactory_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  /**
   * Triggers a down event on the template selector.
   *
   * It triggers the event and make sure posting animation is complete.
   *
   * @param {HTMLElement} element The opl-template-selector element
   */
  function triggerPointerDown(element) {
    var templateElements = element[0].querySelectorAll('button');
    var selectedTemplate = element[0].querySelector('.opl-selected');
    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));

    templateSelectorElement.triggerHandler({type: oplEventsFactory.EVENTS.DOWN, target: selectedTemplate});
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });
  }

  /**
   * Waits 5 seconds until templates are closed.
   *
   * It waits 5 seconds and make sure masking animation is complete.
   *
   * @param {HTMLElement} element The opl-template-selector element
   */
  function waitForClosedTemplates(element) {
    var templateElements = element[0].querySelectorAll('button');

    $timeout.flush(5000);
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });
  }

  /**
   * Triggers a "focus" event on the template selector.
   *
   * It triggers a "focus" event and make sure posting animation is complete.
   *
   * @param {HTMLElement} element The opl-template-selector element
   */
  function triggerFocus(element) {
    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');

    templateSelectorElement.triggerHandler('focus');
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });
  }

  /**
   * Clicks on a template.
   *
   * It fires a down event followed by a up event on the template element.
   *
   * @param {HTMLElement} element The opl-template-selector element
   * @param {String} template The name of the template to click on
   */
  function clickOnTemplate(element, template) {
    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');
    var bodyElement = angular.element($document[0].body);

    for (var i = 0; i < templateElements.length; i++) {
      var templateElement = angular.element(templateElements[i]);
      if (templateElement.attr('data-id') === template) {
        templateSelectorElement.triggerHandler({type: oplEventsFactory.EVENTS.DOWN, target: templateElement[0]});
        bodyElement.triggerHandler({type: oplEventsFactory.EVENTS.UP, target: templateElement[0]});
      }
    }
  }

  /**
   * Finds a template HTML element by name.
   *
   * @param {HTMLElement} element The opl-template-selector element
   * @param {String} template The name of the template to look for
   * @return {HTMLElement} The template HTML element
   */
  function findTemplateElement(element, template) {
    var templateElements = element[0].querySelectorAll('button');

    for (var i = 0; i < templateElements.length; i++) {
      if (angular.element(templateElements[i]).attr('data-id') === template)
        return templateElements[i];
    }
  }

  /**
   * Triggers a "blur" event on the template element.
   *
   * It triggers a "blur" event and make sure masking animation is complete.
   *
   * @param {HTMLElement} element The opl-template-selector element
   * @param {HTMLElement} templateElement The template element to unfocus
   */
  function triggerTemplateBlur(element, templateElement) {
    var templateElements = element[0].querySelectorAll('button');

    angular.element(templateElement).triggerHandler('blur');
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });
  }

  it('should contain a list of predefined templates', function() {
    var expectedAriaLabel = 'Template selector label';
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-label="' + expectedAriaLabel + '"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var isolateScope = element.isolateScope();
    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');

    assert.equal(templateSelectorElement.attr('tabindex'), '0', 'Wrong tabindex');
    assert.equal(templateSelectorElement.attr('aria-label'), expectedAriaLabel, 'Wrong ARIA label');

    for (var i = 0; i < templateElements.length; i++) {
      var templateElement = angular.element(templateElements[i]);
      assert.equal(
        templateElement.attr('tabindex'),
        '-1',
        'Wrong tabindex for template ' + templateElement.attr('data-id')
      );
      assert.equal(
        templateElement.attr('aria-label'),
        isolateScope.templates[i].label,
        'Wrong ARIA label for template ' + templateElement.attr('data-id')
      );
      assert.equal(
        templateElement.find('i').text(),
        isolateScope.templates[i].id,
        'Wrong template ' + templateElement.attr('data-id')
      );
    }
  });

  it('should display selected template by default and mark it as selected', function() {
    scope.template = 'split_1';
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="{{template}}"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateElements = element[0].querySelectorAll('button');
    templateElements.forEach(function(templateElement) {
      templateElement = angular.element(templateElement);
      if (templateElement.attr('data-id') === scope.template) {
        assert.equal(
          templateElement.attr('aria-selected'),
          'true',
          'Expected template "' + templateElement.attr('data-id') + '" to be selected'
        );
        assert.equal(
          templateElement.attr('aria-hidden'),
          'false',
          'Expected template "' + templateElement.attr('data-id') + '" to be displayed'
        );
      } else {
        assert.equal(
          templateElement.attr('aria-selected'),
          'false',
          'Expected template "' + templateElement.attr('data-id') + '" to not be selected'
        );
        assert.equal(
          templateElement.attr('aria-hidden'),
          'true',
          'Expected template "' + templateElement.attr('data-id') + '" to be hidden'
        );
      }
    });
  });

  it('should display all templates on pointer down and hide templates after 5 seconds', function() {
    scope.template = 'split_1';
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="{{template}}"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateElements = element[0].querySelectorAll('button');

    triggerPointerDown(element);

    templateElements.forEach(function(templateElement) {
      templateElement = angular.element(templateElement);
      assert.equal(
        templateElement.attr('aria-hidden'),
        'false',
        'Expected template "' + templateElement.attr('data-id') + '" to be displayed'
      );
    });

    waitForClosedTemplates(element);

    templateElements.forEach(function(templateElement) {
      templateElement = angular.element(templateElement);

      if (templateElement.attr('data-id') === scope.template) {
        assert.equal(
          templateElement.attr('aria-hidden'),
          'false',
          'Expected template "' + templateElement.attr('data-id') + '" to be displayed'
        );
      } else {
        assert.equal(
          templateElement.attr('aria-hidden'),
          'true',
          'Expected template "' + templateElement.attr('data-id') + '" to be hidden'
        );
      }
    });
  });

  it('should call function defined in "opl-on-update" when a new template is chosen', function() {
    var expectedTemplate = 'split_2';
    scope.handleOnUpdate = chai.spy(function(template) {
      assert.equal(template, expectedTemplate, 'Wrong template');
    });
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  ' opl-on-update="handleOnUpdate(template)"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    clickOnTemplate(element, expectedTemplate);

    scope.handleOnUpdate.should.have.been.called.exactly(1);
  });

  it('should hide templates if template changes', function() {
    var expectedTemplate = 'split_2';
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="{{template}}"' +
                                  '></opl-template-selector>');
    scope.template = 'split_1';
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');

    triggerPointerDown(element);

    scope.template = expectedTemplate;
    scope.$digest();
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });

    assert.notOk(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be hidden');

    templateElements.forEach(function(templateElement) {
      templateElement = angular.element(templateElement);

      if (templateElement.attr('data-id') === expectedTemplate) {
        assert.equal(
          templateElement.attr('aria-hidden'),
          'false',
          'Expected template "' + templateElement.attr('data-id') + '" to be displayed'
        );
      } else {
        assert.equal(
          templateElement.attr('aria-hidden'),
          'true',
          'Expected template "' + templateElement.attr('data-id') + '" to be hidden'
        );
      }
    });
  });

  it('should set focus to selected template on focus', function() {
    scope.template = 'split_2';
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="{{template}}"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var selectedTemplateElement = findTemplateElement(element, scope.template);

    selectedTemplateElement.focus = chai.spy(selectedTemplateElement.focus);

    templateSelectorElement.triggerHandler('focus');

    selectedTemplateElement.focus.should.have.been.called.exactly(1);
  });

  it('should display templates when focused', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));

    triggerFocus(element);

    assert.ok(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be displayed');
  });

  it('should move focus among templates when using LEFT/BOTTOM and RIGHT/TOP keys', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var orderedTemplates = ['split_1', 'split_50_50', 'split_2', 'split_25_75'];
    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');
    var selectedTemplateIndex = orderedTemplates.indexOf('split_1');
    var siblingTemplateIndex = selectedTemplateIndex;
    var templateElementsByIds = {};

    templateSelectorElement.triggerHandler('focus');
    templateElements.forEach(function(templateElement) {
      templateElement.focus = chai.spy(templateElement.focus);
      templateElementsByIds[angular.element(templateElement).attr('data-id')] = templateElement;
      angular.element(templateElement).triggerHandler('transitionend');
    });
    angular.element(templateElementsByIds[orderedTemplates[0]]).triggerHandler('focus');

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 37});
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('blur');
    siblingTemplateIndex++;
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('focus');

    templateElementsByIds[orderedTemplates[siblingTemplateIndex]].focus.should.have.been.called.exactly(1);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 40});
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('blur');
    siblingTemplateIndex++;
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('focus');

    templateElementsByIds[orderedTemplates[siblingTemplateIndex]].focus.should.have.been.called.exactly(1);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 40});
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('blur');
    siblingTemplateIndex++;
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('focus');

    templateElementsByIds[orderedTemplates[siblingTemplateIndex]].focus.should.have.been.called.exactly(1);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 40});
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('blur');
    siblingTemplateIndex = 0;
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('focus');

    templateElementsByIds[orderedTemplates[siblingTemplateIndex]].focus.should.have.been.called.exactly(1);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 38});
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('blur');
    siblingTemplateIndex = orderedTemplates.length - 1;
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('focus');

    templateElementsByIds[orderedTemplates[siblingTemplateIndex]].focus.should.have.been.called.exactly(2);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 39});
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('blur');
    siblingTemplateIndex--;
    angular.element(templateElementsByIds[orderedTemplates[siblingTemplateIndex]]).triggerHandler('focus');

    templateElementsByIds[orderedTemplates[siblingTemplateIndex]].focus.should.have.been.called.exactly(2);
  });

  it('should be able to select a template using ENTER key', function() {
    var expectedTemplate = 'split_2';
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  ' opl-on-update="handleOnUpdate(template)"' +
                                  '></opl-template-selector>');
    scope.handleOnUpdate = chai.spy(function(template) {
      assert.equal(template, expectedTemplate, 'Wrong template');
    });
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));

    templateSelectorElement.triggerHandler(
      {type: 'keydown', keyCode: 13, target: findTemplateElement(element, expectedTemplate)}
    );

    scope.handleOnUpdate.should.have.been.called.exactly(1);
  });

  it('should hide templates when using TAB key', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');

    triggerFocus(element);
    angular.element(templateElements[0]).triggerHandler('focus');

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 9});
    triggerTemplateBlur(element, templateElements[0]);

    assert.notOk(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be hidden');
  });

  it('should display templates when using LEFT/BOTTOM and RIGHT/TOP keys', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));
    var templateElements = element[0].querySelectorAll('button');

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 37});
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });

    assert.ok(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be displayed when using LEFT');

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 9});
    triggerTemplateBlur(element, templateElements[0]);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 40});
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });

    assert.ok(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be displayed when using BOTTOM');

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 9});
    triggerTemplateBlur(element, templateElements[0]);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 38});
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });

    assert.ok(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be displayed when using TOP');

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 9});
    triggerTemplateBlur(element, templateElements[0]);

    templateSelectorElement.triggerHandler({type: 'keydown', keyCode: 39});
    templateElements.forEach(function(templateElement) {
      angular.element(templateElement).triggerHandler('transitionend');
    });

    assert.ok(templateSelectorElement.hasClass('opl-posted'), 'Expected templates to be displayed when using RIGHT');
  });

  it('should add class "opl-focus" when focused', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));

    templateSelectorElement.triggerHandler('focus');

    assert.ok(templateSelectorElement.hasClass('opl-focus'), 'Expected class "opl-focus"');
  });

  it('should remove class "opl-focus" when unfocused', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));

    templateSelectorElement.triggerHandler('focus');
    templateSelectorElement.triggerHandler('focus');
    templateSelectorElement.triggerHandler('blur');

    assert.notOk(templateSelectorElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
  });

  it('should call function defined in "opl-on-focus" attribute when focused', function() {
    scope.handleOnFocus = chai.spy(function() {});
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  ' opl-on-focus="handleOnFocus()"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateSelectorElement = angular.element(element[0].querySelector('.opl-template-selector'));

    templateSelectorElement.triggerHandler('focus');

    scope.handleOnFocus.should.have.been.called.exactly(1);
  });

  it('should add class "opl-template-focus" when a template is focused', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateElements = element[0].querySelectorAll('button');

    angular.element(templateElements[0]).triggerHandler('focus');

    assert.ok(
      angular.element(templateElements[0]).hasClass('opl-template-focus'),
      'Expected class "opl-template-focus"'
    );
  });

  it('should remove class "opl-template-focus" when a template is unfocused', function() {
    var element = angular.element('<opl-template-selector ' +
                                  ' opl-template="split_1"' +
                                  '></opl-template-selector>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var templateElements = element[0].querySelectorAll('button');

    angular.element(templateElements[0]).triggerHandler('focus');
    angular.element(templateElements[0]).triggerHandler('blur');

    assert.notOk(
      angular.element(templateElements[0]).hasClass('opl-template-focus'),
      'Unexpected class "opl-template-focus"'
    );
  });
});
