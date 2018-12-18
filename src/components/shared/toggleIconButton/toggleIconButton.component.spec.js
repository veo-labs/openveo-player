'use strict';

window.assert = chai.assert;

describe('OplToggleIconButton', function() {
  var $compile;
  var $rootScope;
  var $document;
  var scope;
  var bodyElement;

  // Load modules
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
    bodyElement = angular.element($document[0].body);
  });

  it('should display a button with two icons', function() {
    var expectedOffIconLigature = 'off_icon';
    var expectedOnIconLigature = 'on_icon';
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-off-icon="' + expectedOffIconLigature + '"' +
                                  ' opl-on-icon="' + expectedOnIconLigature + '"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element[0].querySelector('button');
    assert.isNotNull(buttonElement, 'Expected a button');

    assert.equal(
      angular.element(buttonElement.querySelector('.opl-off')).text(),
      expectedOffIconLigature,
      'Wrong "off" icon'
    );
    assert.equal(
      angular.element(buttonElement.querySelector('.opl-on')).text(),
      expectedOnIconLigature,
      'Wrong "on" icon'
    );
  });

  it('should display "on" icon if state is "on"', function() {
    var expectedOnIconLigature = 'on_icon';
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="true"' +
                                  ' opl-off-icon="off_icon"' +
                                  ' opl-on-icon="' + expectedOnIconLigature + '"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var onElement = element[0].querySelector('.opl-on');
    var offElement = element[0].querySelector('.opl-off');
    assert.equal(
      angular.element(onElement).text(),
      expectedOnIconLigature,
      'Wrong "on" icon'
    );
    assert.notOk(
      angular.element(onElement).hasClass('ng-hide'),
      'Expected "on" icon to be displayed'
    );
    assert.ok(
      angular.element(offElement).hasClass('ng-hide'),
      'Expected "off" icon to be hidden'
    );
  });

  it('should display "off" icon if state is "off"', function() {
    var expectedOffIconLigature = 'off_icon';
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="false"' +
                                  ' opl-off-icon="' + expectedOffIconLigature + '"' +
                                  ' opl-on-icon="on_icon"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var onElement = element[0].querySelector('.opl-on');
    var offElement = element[0].querySelector('.opl-off');
    assert.equal(
      angular.element(offElement).text(),
      expectedOffIconLigature,
      'Wrong "off" icon'
    );
    assert.notOk(
      angular.element(offElement).hasClass('ng-hide'),
      'Expected "off" icon to be displayed'
    );
    assert.ok(
      angular.element(onElement).hasClass('ng-hide'),
      'Expected "on" icon to be hidden'
    );
  });

  it('should set "off" ARIA label if state is "off"', function() {
    var expectedOfflabel = 'Off label';
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="false"' +
                                  ' opl-off-label="' + expectedOfflabel + '"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    assert.equal(buttonElement.attr('aria-label'), expectedOfflabel, 'Wrong label');
  });

  it('should set "on" ARIA label if state is "on"', function() {
    var expectedOnlabel = 'On label';
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="true"' +
                                  ' opl-on-label="' + expectedOnlabel + '"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    assert.equal(buttonElement.attr('aria-label'), expectedOnlabel, 'Wrong label');
  });

  it('should set "aria-pressed" to true if state is "on"', function() {
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="true"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    assert.equal(buttonElement.attr('aria-pressed'), 'true', 'Expected aria-pressed to be true');
  });

  it('should set "aria-pressed" to false if state is "off"', function() {
    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="false"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    assert.equal(buttonElement.attr('aria-pressed'), 'false', 'Expected aria-pressed to be false');
  });

  it('should call oplOnUpdate function with the other state if clicked', function() {
    var expectedState = true;

    scope.expectedOnUpdateFunction = chai.spy(function(state) {
      assert.equal(state, expectedState, 'Wrong state');
    });

    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="' + !expectedState + '"' +
                                  ' opl-on-update="expectedOnUpdateFunction(on)"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    buttonElement.triggerHandler('mousedown');
    bodyElement.triggerHandler('mouseup');

    scope.expectedOnUpdateFunction.should.have.been.called.exactly(1);
  });

  it('should be able to update the button state', function() {
    scope.on = false;
    scope.expectedOffIconLigature = 'off_icon';
    scope.expectedOnIconLigature = 'on_icon';
    scope.expectedOnLabel = 'On label';
    scope.expectedOffLabel = 'Off label';
    scope.expectedOnUpdateFunction = chai.spy(function(state) {
      scope.on = state;
    });

    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="{{on}}"' +
                                  ' opl-off-icon="{{expectedOffIconLigature}}"' +
                                  ' opl-on-icon="{{expectedOnIconLigature}}"' +
                                  ' opl-off-label="{{expectedOffLabel}}"' +
                                  ' opl-on-label="{{expectedOnLabel}}"' +
                                  ' opl-on-update="expectedOnUpdateFunction(on)"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    var onElement = element[0].querySelector('.opl-on');
    var offElement = element[0].querySelector('.opl-off');

    // Switch state to "on"
    buttonElement.triggerHandler('mousedown');
    bodyElement.triggerHandler('mouseup');
    scope.$digest();

    assert.notOk(
      angular.element(onElement).hasClass('ng-hide'),
      'Expected "on" icon to be displayed'
    );
    assert.ok(
      angular.element(offElement).hasClass('ng-hide'),
      'Expected "off" icon to be hidden'
    );
    assert.equal(buttonElement.attr('aria-pressed'), 'true', 'Expected aria-pressed to be true');
    assert.equal(buttonElement.attr('aria-label'), scope.expectedOnLabel, 'Expected "on" label');

    // Switch state to "off"
    buttonElement.triggerHandler('mousedown');
    bodyElement.triggerHandler('mouseup');
    scope.$digest();

    assert.notOk(
      angular.element(offElement).hasClass('ng-hide'),
      'Expected "off" icon to be displayed'
    );
    assert.ok(
      angular.element(onElement).hasClass('ng-hide'),
      'Expected "on" icon to be hidden'
    );
    assert.equal(buttonElement.attr('aria-pressed'), 'false', 'Expected aria-pressed to be false');
    assert.equal(buttonElement.attr('aria-label'), scope.expectedOffLabel, 'Expected "off" label');

    scope.expectedOnUpdateFunction.should.have.been.called.exactly(2);
  });

  it('should set class "opl-focus" when focused', function() {
    var element = angular.element('<opl-toggle-icon-button></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');

    buttonElement.triggerHandler('focus');

    assert.ok(buttonElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

    buttonElement.triggerHandler('blur');

    assert.notOk(buttonElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
  });

  it('should call function defined in "opl-on-focus" attribute when focused', function() {
    scope.handleOnFocus = chai.spy(function() {});
    var element = angular.element('<opl-toggle-icon-button opl-on-focus="handleOnFocus()"></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');

    buttonElement.triggerHandler('focus');

    scope.handleOnFocus.should.have.been.called.exactly(1);
  });

  it('should be able to change the button state dynamically', function() {
    scope.on = false;
    scope.expectedOffIconLigature = 'off_icon';
    scope.expectedOnIconLigature = 'on_icon';
    scope.expectedOnLabel = 'On label';
    scope.expectedOffLabel = 'Off label';

    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="{{on}}"' +
                                  ' opl-off-icon="{{expectedOffIconLigature}}"' +
                                  ' opl-on-icon="{{expectedOnIconLigature}}"' +
                                  ' opl-off-label="{{expectedOffLabel}}"' +
                                  ' opl-on-label="{{expectedOnLabel}}"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');
    var onElement = element[0].querySelector('.opl-on');
    var offElement = element[0].querySelector('.opl-off');

    // Switch state to "on"
    scope.on = true;
    scope.$digest();

    assert.notOk(
      angular.element(onElement).hasClass('ng-hide'),
      'Expected "on" icon to be displayed'
    );
    assert.ok(
      angular.element(offElement).hasClass('ng-hide'),
      'Expected "off" icon to be hidden'
    );
    assert.equal(buttonElement.attr('aria-pressed'), 'true', 'Expected aria-pressed to be true');
    assert.equal(buttonElement.attr('aria-label'), scope.expectedOnLabel, 'Expected "on" label');

    // Switch state to "off"
    scope.on = false;
    scope.$digest();

    assert.notOk(
      angular.element(offElement).hasClass('ng-hide'),
      'Expected "off" icon to be displayed'
    );
    assert.ok(
      angular.element(onElement).hasClass('ng-hide'),
      'Expected "on" icon to be hidden'
    );
    assert.equal(buttonElement.attr('aria-pressed'), 'false', 'Expected aria-pressed to be false');
    assert.equal(buttonElement.attr('aria-label'), scope.expectedOffLabel, 'Expected "off" label');
  });

  it('should be able to change the "on" and "off" icons dynamically', function() {
    scope.offIconLigature = 'off_icon';
    scope.onIconLigature = 'on_icon';

    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="true"' +
                                  ' opl-off-icon="{{offIconLigature}}"' +
                                  ' opl-on-icon="{{onIconLigature}}"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var onElement = element[0].querySelector('.opl-on');
    var offElement = element[0].querySelector('.opl-off');

    // Change icons
    scope.offIconLigature = 'new_off_icon';
    scope.onIconLigature = 'new_on_icon';
    scope.$digest();

    assert.equal(
      angular.element(offElement).text(),
      scope.offIconLigature,
      'Wrong "off" icon'
    );

    assert.equal(
      angular.element(onElement).text(),
      scope.onIconLigature,
      'Wrong "on" icon'
    );
  });

  it('should be able to change the "on" and "off" labels dynamically', function() {
    scope.on = false;
    scope.offLabel = 'Off label';
    scope.onLabel = 'On label';

    var element = angular.element('<opl-toggle-icon-button ' +
                                  ' opl-on="{{on}}"' +
                                  ' opl-off-label="{{offLabel}}"' +
                                  ' opl-on-label="{{onLabel}}"' +
                                  '></opl-toggle-icon-button>');
    element = $compile(element)(scope);
    scope.$digest();

    var buttonElement = element.find('button');

    scope.offLabel = 'New off label';
    scope.$digest();

    assert.equal(
      buttonElement.attr('aria-label'),
      scope.offLabel,
      'Wrong "off" label'
    );

    scope.on = true;
    scope.onLabel = 'New on label';
    scope.$digest();

    assert.equal(
      buttonElement.attr('aria-label'),
      scope.onLabel,
      'Wrong "on" label'
    );
  });

});
