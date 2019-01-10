'use strict';

window.assert = chai.assert;

describe('OplVolume', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var $filter;
  var scope;
  var ctrl;
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
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$filter_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $filter = _$filter_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();

    var style = 'body{width: 100%; height: 100%;}' +
      'opl-volume, .opl-volume{width: 100%; height: 32px;}';
    var styleElement = $document[0].createElement('style');
    styleElement.setAttribute('id', 'opl-volume-test-style');
    styleElement.appendChild($document[0].createTextNode(style));
    $document[0].head.appendChild(styleElement);
  });

  afterEach(function() {
    var volumeElement = $document[0].body.querySelector('#opl-volume-test');
    $document[0].head.removeChild($document[0].head.querySelector('#opl-volume-test-style'));
    if (volumeElement) $document[0].body.removeChild(volumeElement);
  });

  it('should display a toggle icon button and a slider', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var buttonElement = element.find('opl-toggle-icon-button');
    var sliderElement = element.find('opl-slider');

    assert.isNotEmpty(buttonElement, 'Expected a toggle icon button');
    assert.equal(
      angular.element(buttonElement).attr('opl-on'),
      'false',
      'Wrong button state'
    );
    assert.equal(
      angular.element(buttonElement).attr('opl-off-icon'),
      'volume_up',
      'Wrong button "off" icon'
    );
    assert.equal(
      angular.element(buttonElement).attr('opl-on-icon'),
      'volume_off',
      'Wrong button "on" icon'
    );
    assert.equal(
      buttonElement.attr('opl-off-label'),
      $filter('oplTranslate')('CONTROLS_VOLUME_MUTE_ARIA_LABEL'),
      'Wrong button "off" label'
    );
    assert.equal(
      buttonElement.attr('opl-on-label'),
      $filter('oplTranslate')('CONTROLS_VOLUME_UNMUTE_ARIA_LABEL'),
      'Wrong button "on" label'
    );

    assert.isNotEmpty(sliderElement, 'Expected a slider');
    assert.equal(
      sliderElement.attr('opl-step'),
      '1',
      'Wrong slider step'
    );
    assert.equal(
      sliderElement.attr('opl-label'),
      $filter('oplTranslate')('CONTROLS_VOLUME_CURSOR_ARIA_LABEL'),
      'Wrong slider label'
    );
    assert.equal(
      sliderElement.attr('opl-value-text'),
      $filter('oplTranslate')('CONTROLS_VOLUME_TEXT_ARIA_LABEL'),
      'Wrong slider value text'
    );
  });

  it('should not be able to set a volume bigger than 100', function() {
    scope.value = 150;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should not be able to set a volume lower than 0', function() {
    scope.value = -50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should display the volume "on" button if volume is greater than 0', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplVolume');

    assert.notOk(ctrl.muted, 'Wrong button');
  });

  it('should display the volume "off" button if volume is 0', function() {
    scope.value = 0;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplVolume');

    assert.ok(ctrl.muted, 'Wrong button');
  });

  it('should mute the volume when hitting the button while volume is up', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplVolume');
    var isolateScope = element.isolateScope();

    ctrl.toggleSound(true);

    assert.ok(ctrl.muted, 'Expected volume to be muted');
    assert.equal(scope.value, 0, 'Wrong volume value');
    assert.equal(isolateScope.sliderValue, 0, 'Wrong slider value');
  });

  it('should restore the volume when hitting the button while volume is muted', function() {
    var expectedVolume = 50;
    scope.value = expectedVolume;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplVolume');
    var isolateScope = element.isolateScope();

    // First mute
    ctrl.toggleSound(true);

    // Then unmute
    ctrl.toggleSound(false);

    assert.notOk(ctrl.muted, 'Wrong button');
    assert.equal(scope.value, expectedVolume, 'Wrong volume value');
    assert.equal(isolateScope.sliderValue, expectedVolume, 'Wrong slider value');
  });

  it('should update the volume when using the slider', function() {
    var expectedVolume = 42;
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplVolume');

    ctrl.setLevel(expectedVolume);
    scope.$digest();

    assert.equal(scope.value, expectedVolume, 'Wrong volume value');
  });

  it('should display the volume "off" button if slider goes down to 0', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    ctrl = element.controller('oplVolume');
    var isolateScope = element.isolateScope();

    ctrl.setLevel(0);

    assert.ok(ctrl.muted, 'Wrong button');
    assert.equal(isolateScope.sliderValue, 0, 'Wrong slider value');
    assert.equal(scope.value, 0, 'Wrong volume value');
  });

  it('should add class "opl-volume-focus" to the volume element if button is focused', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var buttonElement = angular.element(element[0].querySelector('.opl-toggle-icon-button'));

    buttonElement.triggerHandler('focus');

    assert.ok(volumeElement.hasClass('opl-volume-focus'), 'Expected focus class');
  });

  it('should add class "opl-volume-focus" to the volume element if slider is focused', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('focus');

    assert.ok(volumeElement.hasClass('opl-volume-focus'), 'Expected focus class');
  });

  it('should remove class "opl-volume-focus" from the volume element if slider loses the focus', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('focus');
    sliderElement.triggerHandler('blur');

    assert.notOk(volumeElement.hasClass('opl-volume-focus'), 'Unexpected focus class');
  });

  it('should remove class "opl-volume-focus" from the volume element if button loses the focus', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var buttonElement = angular.element(element[0].querySelector('.opl-toggle-icon-button'));

    buttonElement.triggerHandler('focus');
    buttonElement.triggerHandler('blur');

    assert.notOk(volumeElement.hasClass('opl-volume-focus'), 'Unexpected focus class');
  });

  it('should open the volume controller on pointer over and close it on pointer out', function() {
    scope.value = 50;

    var element = angular.element('<opl-volume ng-model="value"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var sliderWrapperElement = angular.element(element[0].querySelector('.opl-volume > div'));

    volumeElement.triggerHandler('mouseover');
    angular.element(sliderWrapperElement).triggerHandler('transitionend');
    $timeout.flush();

    assert.ok(volumeElement.hasClass('opl-over'), 'Expected class "opl-over"');

    volumeElement.triggerHandler('mouseout');
    $timeout.flush();
    angular.element(sliderWrapperElement).triggerHandler('transitionend');

    assert.notOk(volumeElement.hasClass('opl-over'), 'Unexpected class "opl-over"');
  });

  it('should call function defined in "opl-on-open" attribute when opened', function() {
    scope.value = 50;
    scope.handleOnOpen = chai.spy(function() {});

    var element = angular.element('<opl-volume ng-model="value" opl-on-open="handleOnOpen()"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var sliderWrapperElement = angular.element(element[0].querySelector('.opl-volume > div'));

    volumeElement.triggerHandler('mouseover');
    angular.element(sliderWrapperElement).triggerHandler('transitionend');
    $timeout.flush();

    scope.handleOnOpen.should.have.been.called.exactly(1);
  });

  it('should call function defined in "opl-on-close" attribute when closed', function() {
    scope.value = 50;
    scope.handleOnClose = chai.spy(function() {});

    var element = angular.element('<opl-volume ng-model="value" opl-on-close="handleOnClose()"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var volumeElement = angular.element(element[0].querySelector('.opl-volume'));
    var sliderWrapperElement = angular.element(element[0].querySelector('.opl-volume > div'));

    volumeElement.triggerHandler('mouseover');
    angular.element(sliderWrapperElement).triggerHandler('transitionend');
    $timeout.flush();

    volumeElement.triggerHandler('mouseout');
    $timeout.flush();
    angular.element(sliderWrapperElement).triggerHandler('transitionend');
    $timeout.flush();

    scope.handleOnClose.should.have.been.called.exactly(1);
  });

  it('should call function defined in "opl-on-focus" attribute when a sub component is focused', function() {
    scope.value = 50;
    scope.handleOnFocus = chai.spy(function() {});

    var element = angular.element('<opl-volume ng-model="value" opl-on-focus="handleOnFocus()"></opl-volume>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var isolateScope = angular.element(element[0]).isolateScope();

    isolateScope.handleFocus();

    scope.handleOnFocus.should.have.been.called.exactly(1);
  });

});
