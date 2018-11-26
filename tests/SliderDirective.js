'use strict';

window.assert = chai.assert;

describe('SliderDirective', function() {
  var $compile;
  var $rootScope;
  var scope;

  // Load modules player and templates (to mock templates)
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should define attributes ov-step and ov-label', function() {
    var expectedStep = 42;
    var expectedLabel = 'Label';
    scope.value = 50;

    var element = angular.element('<ov-player-slider ' +
                                  'ng-model="value" ' +
                                  'ov-step="' + expectedStep + '" ' +
                                  'ov-label="' + expectedLabel + '"' +
                                  '></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.equal(isolateScope.ovStep, expectedStep, 'Wrong step');
    assert.equal(isolateScope.ovLabel, expectedLabel, 'Wrong label');
  });

  it('should set step to 0 if not defined', function() {
    scope.value = 50;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.equal(isolateScope.ovStep, 0, 'Wrong step');
  });

  it('should set label to "Select a value" if not defined', function() {
    scope.value = 50;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    assert.equal(isolateScope.ovLabel, 'Select a value', 'Wrong label');
  });

  it('should inscrease value by 1 when hitting RIGHT or UP key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 38});
    element.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(scope.value, initialValue + 2, 'Wrong value');
  });

  it('should decrease value by 1 when hitting LEFT or BOTTOM key', function() {
    var initialValue = 42;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 37});
    element.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(scope.value, initialValue - 2, 'Wrong value');
  });

  it('should inscrease value by step value when hitting RIGHT or UP key if step is specified', function() {
    var initialValue = 40;
    var expectedStep = 10;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ' +
                                  'ng-model="value" ' +
                                  'ov-step="' + expectedStep + '"' +
                                  '></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 38});
    element.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(scope.value, initialValue + expectedStep * 2, 'Wrong value');
  });

  it('should descrease value by step value when hitting LEFT or DOWN key if step is specified', function() {
    var initialValue = 40;
    var expectedStep = 10;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ' +
                                  'ng-model="value" ' +
                                  'ov-step="' + expectedStep + '"' +
                                  '></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 37});
    element.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(scope.value, initialValue - expectedStep * 2, 'Wrong value');
  });

  it('should not be able to set a value inferior to 0 when hitting LEFT or DOWN key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 37});
    element.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should not be able to set a value superior to 100 when hitting RIGHT or UP key', function() {
    var initialValue = 100;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 38});
    element.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should set value to 0 when hitting BEGIN key', function() {
    var initialValue = 100;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 36});
    scope.$apply();

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should set value to 100 when hitting END key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler({type: 'keydown', keyCode: 35});
    scope.$apply();

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should not be able to set a value outside of a step if step is specified', function() {
    var initialValue = 42;
    scope.value = initialValue;

    var element = angular.element('<ov-player-slider ng-model="value" ov-step="10"></ov-player-slider>');
    $compile(element)(scope);
    scope.$digest();

    assert.equal(scope.value, 40, 'Wrong value');
  });

  it('should set value to 0 if inferior to 0', function() {
    scope.value = -42;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    $compile(element)(scope);
    scope.$digest();

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should set value to 100 if superior to 100', function() {
    scope.value = 142;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    $compile(element)(scope);
    scope.$digest();

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should be considered as not empty even if value is 0', function() {
    scope.value = 0;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    assert.notOk(element.controller('ngModel').$isEmpty(), 'Expected slider to be non empty');
  });

  it('should set class "ov-player-slider-focus" when receiving focus', function() {
    scope.value = 0;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler('focus');
    scope.$apply();

    assert.ok(element.hasClass('ov-player-slider-focus'), 'Expected class "ov-player-slider-focus"');
  });

  it('should remove class "ov-player-slider-focus" when losing focus', function() {
    scope.value = 0;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler('focus');
    scope.$apply();

    element.triggerHandler('blur');
    scope.$apply();

    assert.notOk(element.hasClass('ov-player-slider-focus'), 'Unexpected class "ov-player-slider-focus"');
  });

  it('should set class "ov-player-slider-active" when pressed', function() {
    scope.value = 0;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler('mousedown');
    scope.$apply();

    assert.ok(element.hasClass('ov-player-slider-active'), 'Expected class "ov-player-slider-active"');
  });

  it('should remove class "ov-player-slider-active" when released', function() {
    scope.value = 0;

    var element = angular.element('<ov-player-slider ng-model="value"></ov-player-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    element.triggerHandler('mouseup');
    scope.$apply();

    assert.notOk(element.hasClass('ov-player-slider-active'), 'Unexpected class "ov-player-slider-active"');
  });

});
