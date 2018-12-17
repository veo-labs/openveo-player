'use strict';

window.assert = chai.assert;

describe('OplSlider', function() {
  var $compile;
  var $rootScope;
  var scope;
  var ctrl;

  // Load modules
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

  it('should be able to set the ARIA label', function() {
    var expectedLabel = 'Label';
    scope.value = 50;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-label="' + expectedLabel + '"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    assert.equal(ctrl.oplLabel, expectedLabel, 'Wrong label');
  });

  it('should set label to "Select a value" if not defined', function() {
    scope.value = 50;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    assert.equal(ctrl.label, 'Select a value', 'Wrong label');
  });

  it('should increase value by 1 when hitting RIGHT or UP key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(ctrl.value, initialValue + 2, 'Wrong value');
  });

  it('should decrease value by 1 when hitting LEFT or BOTTOM key', function() {
    var initialValue = 42;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 37});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(ctrl.value, initialValue - 2, 'Wrong value');
  });

  it('should increase value by step value when hitting RIGHT or UP key if step is specified', function() {
    var initialValue = 40;
    var expectedStep = 10;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-step="' + expectedStep + '"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(ctrl.value, initialValue + expectedStep * 2, 'Wrong value');
  });

  it('should descrease value by step value when hitting LEFT or DOWN key if step is specified', function() {
    var initialValue = 40;
    var expectedStep = 10;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-step="' + expectedStep + '"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 37});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(ctrl.value, initialValue - expectedStep * 2, 'Wrong value');
  });

  it('should not be able to set a value inferior to 0 when hitting LEFT or DOWN key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 37});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(ctrl.value, 0, 'Wrong value');
  });

  it('should not be able to set a value superior to 100 when hitting RIGHT or UP key', function() {
    var initialValue = 100;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(ctrl.value, 100, 'Wrong value');
  });

  it('should set value to 0 when hitting BEGIN key', function() {
    var initialValue = 100;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 36});
    scope.$apply();

    assert.equal(ctrl.value, 0, 'Wrong value');
  });

  it('should set value to 100 when hitting END key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 35});
    scope.$apply();

    assert.equal(ctrl.value, 100, 'Wrong value');
  });

  it('should not be able to set a value outside of a step if step is specified', function() {
    var initialValue = 42;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value" opl-step="10"></opl-slider>');
    $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    assert.equal(ctrl.value, 40, 'Wrong value');
  });

  it('should set value to 0 if inferior to 0', function() {
    scope.value = -42;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    assert.equal(ctrl.value, 0, 'Wrong value');
  });

  it('should set value to 100 if superior to 100', function() {
    scope.value = 142;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplSlider');

    assert.equal(ctrl.value, 100, 'Wrong value');
  });

  it('should be considered as not empty even if value is 0', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    assert.notOk(element.controller('ngModel').$isEmpty(), 'Expected slider to be non empty');
  });

  it('should set class "opl-slider-focus" when receiving focus', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('focus');
    scope.$apply();

    assert.ok(sliderElement.hasClass('opl-slider-focus'), 'Expected class "opl-slider-focus"');
  });

  it('should remove class "opl-slider-focus" when losing focus', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('focus');
    scope.$apply();

    sliderElement.triggerHandler('blur');
    scope.$apply();

    assert.notOk(sliderElement.hasClass('opl-slider-focus'), 'Unexpected class "opl-slider-focus"');
  });

  it('should set class "opl-slider-active" when pressed', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('mousedown');
    scope.$apply();

    assert.ok(sliderElement.hasClass('opl-slider-active'), 'Expected class "opl-slider-active"');
  });

  it('should remove class "opl-slider-active" when released', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('mouseup');
    scope.$apply();

    assert.notOk(sliderElement.hasClass('opl-slider-active'), 'Unexpected class "opl-slider-active"');
  });

});
