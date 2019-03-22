'use strict';

window.assert = chai.assert;

describe('OplButton', function() {
  var $compile;
  var $rootScope;
  var oplEventsFactory;
  var scope;
  var originalRequestAnimationFrame;
  var bodyElement;

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

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$window_, _oplEventsFactory_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    oplEventsFactory = _oplEventsFactory_;
    bodyElement = angular.element(_$window_.document.body);
  }));

  afterEach(function() {
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should display a button with an icon and a label', function() {
    var expectedIconLigature = 'ligature';
    var expectedLabel = 'Button label';
    var element = angular.element('<opl-button ' +
                                  ' opl-icon="' + expectedIconLigature + '"' +
                                  ' opl-label="' + expectedLabel + '"' +
                                  '></opl-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element[0].querySelector('button');
    assert.isNotNull(buttonElement, 'Expected a button');

    assert.equal(
      angular.element(buttonElement.querySelector('.opl-icon')).text(),
      expectedIconLigature,
      'Wrong icon'
    );
    assert.equal(angular.element(buttonElement).attr('aria-label'), expectedLabel, 'Wrong label');
  });

  it('should be able to deactivate sequential focus', function() {
    var element = angular.element('<opl-button ' +
                                  ' opl-no-sequential-focus="true"' +
                                  '></opl-button>');
    element = $compile(element)(scope);
    scope.$digest();

    assert.equal(
      angular.element(element[0].querySelector('button')).attr('tabindex'),
      '-1',
      'Wrong tabindex'
    );
  });

  it('should call oplOnUpdate function if clicked', function() {
    var element = angular.element('<opl-button opl-on-update="expectedOnUpdateFunction()"></opl-button>');

    scope.expectedOnUpdateFunction = chai.spy(function() {});
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    buttonElement.triggerHandler(oplEventsFactory.EVENTS.DOWN);
    bodyElement.triggerHandler(oplEventsFactory.EVENTS.UP);

    scope.expectedOnUpdateFunction.should.have.been.called.exactly(1);
  });

  it('should call oplOnUpdate function if actioned using "enter" key', function() {
    var element = angular.element('<opl-button opl-on-update="expectedOnUpdateFunction()"></opl-button>');

    scope.expectedOnUpdateFunction = chai.spy(function() {});
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    buttonElement.triggerHandler({type: 'keydown', keyCode: 13});

    scope.expectedOnUpdateFunction.should.have.been.called.exactly(1);
  });

  it('should add "opl-focus" class and call oplOnFocus when focused', function() {
    var element = angular.element('<opl-button opl-on-focus="expectedOnFocusFunction()"></opl-button>');

    scope.expectedOnFocusFunction = chai.spy(function() {});
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    buttonElement.triggerHandler('focus');

    assert.ok(buttonElement.hasClass('opl-focus'), 'Expected class "opl-focus"');
    scope.expectedOnFocusFunction.should.have.been.called.exactly(1);
  });

  it('should remove "opl-focus" class when unfocused', function() {
    var element = angular.element('<opl-button></opl-button>');

    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    buttonElement.triggerHandler('focus');

    assert.ok(buttonElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

    buttonElement.triggerHandler('blur');

    assert.notOk(buttonElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
  });

  describe('focus', function() {

    it('should focus the button', function() {
      var element = angular.element('<opl-button></opl-button>');

      element = $compile(element)(scope);
      scope.$digest();

      var buttonElement = element.find('button');
      var buttonController = buttonElement.controller('oplButton');

      buttonElement[0].focus = chai.spy(buttonElement[0].focus);

      buttonController.focus();

      buttonElement[0].focus.should.have.been.called.exactly(1);
    });

  });

  describe('isFocused', function() {

    it('should indicate if button is focused or not', function() {
      var element = angular.element('<opl-button></opl-button>');

      element = $compile(element)(scope);
      scope.$digest();

      var buttonElement = element.find('button');
      var buttonController = buttonElement.controller('oplButton');

      buttonElement.triggerHandler('focus');

      assert.ok(buttonController.isFocused(), 'Expected button to be focused');

      buttonElement.triggerHandler('blur');

      assert.notOk(buttonController.isFocused(), 'Unexpected focus');
    });

  });
});
