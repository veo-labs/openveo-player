'use strict';

window.assert = chai.assert;

describe('OplSlider', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $filter;
  var $document;
  var oplEventsFactory;
  var scope;
  var bodyElement;
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
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$filter_, _$document_, _oplEventsFactory_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $filter = _$filter_;
    $document = _$document_;
    oplEventsFactory = _oplEventsFactory_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
    bodyElement = angular.element($document[0].body);

    var style = 'body{width: 100%; height: 100%;}' +
      'opl-slider, .opl-slider{width: 100%; height: 32px;}';
    var styleElement = $document[0].createElement('style');
    styleElement.setAttribute('id', 'opl-slider-test-style');
    styleElement.appendChild($document[0].createTextNode(style));
    $document[0].head.appendChild(styleElement);
  });

  afterEach(function() {
    var sliderElement = $document[0].body.querySelector('#opl-slider-test');
    $document[0].head.removeChild($document[0].head.querySelector('#opl-slider-test-style'));
    if (sliderElement) $document[0].body.removeChild(sliderElement);
  });

  it('should display a slider', function() {
    scope.value = 50;
    scope.label = 'Label';
    scope.valueText = 'Slider value is: %value%';

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-label="{{label}}"' +
                                  'opl-value-text="{{valueText}}"' +
                                  '></opl-slider>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    var thumbElement = angular.element(element[0].querySelector('.opl-slider-thumb-container'));
    var sliderElementBoundingRectangle = sliderElement[0].getBoundingClientRect();
    var thumbPosition = (scope.value / 100) * sliderElementBoundingRectangle.width;

    assert.equal(sliderElement.attr('role'), 'slider', 'Wrong role');
    assert.equal(sliderElement.attr('tabindex'), '0', 'Wrong tabindex');
    assert.equal(sliderElement.attr('aria-valuemin'), '0', 'Wrong aria-valuemin');
    assert.equal(sliderElement.attr('aria-valuemax'), '100', 'Wrong aria-valuemax');
    assert.equal(sliderElement.attr('aria-valuenow'), scope.value, 'Wrong aria-valuenow');
    assert.equal(sliderElement.attr('aria-label'), scope.label, 'Wrong aria-label');
    assert.equal(
      sliderElement.attr('aria-valuetext'),
      $filter('oplTranslate')(scope.valueText, {
        '%value%': scope.value
      }),
      'Wrong aria-valuetext'
    );
    assert.match(
      thumbElement.attr('style'),
      new RegExp('translateX\\(' + thumbPosition + 'px\\)'),
      'Wrong thumb position'
    );
  });

  it('should be able to deactivate sequential focus', function() {
    scope.value = 50;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-no-sequential-focus="true"' +
                                  '></opl-slider>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.equal(
      angular.element(element[0].querySelector('.opl-slider')).attr('tabindex'),
      '-1',
      'Wrong tabindex'
    );
  });

  it('should set label to "Select a value" if not defined', function() {
    scope.value = 50;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    assert.equal(sliderElement.attr('aria-label'), 'Select a value', 'Wrong aria-label');
  });

  it('should increase value by 1 when hitting RIGHT or UP key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(scope.value, initialValue + 2, 'Wrong value');
  });

  it('should decrease value by 1 when hitting LEFT or BOTTOM key', function() {
    var initialValue = 42;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 37});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(scope.value, initialValue - 2, 'Wrong value');
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
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(scope.value, initialValue + expectedStep * 2, 'Wrong value');
  });

  it('should decrease value by step value when hitting LEFT or DOWN key if step is specified', function() {
    var initialValue = 40;
    var expectedStep = 10;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-step="' + expectedStep + '"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 37});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(scope.value, initialValue - expectedStep * 2, 'Wrong value');
  });

  it('should not be able to set a value inferior to 0 when hitting LEFT or DOWN key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 37});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 40});
    scope.$apply();

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should not be able to set a value superior to 100 when hitting RIGHT or UP key', function() {
    var initialValue = 100;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    sliderElement.triggerHandler({type: 'keydown', keyCode: 39});
    scope.$apply();

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should set value to 0 when hitting BEGIN key', function() {
    var initialValue = 100;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 36});
    scope.$apply();

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should set value to 100 when hitting END key', function() {
    var initialValue = 0;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElement.triggerHandler({type: 'keydown', keyCode: 35});
    scope.$apply();

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should not be able to set a value outside of a step if step is specified', function() {
    var initialValue = 42;
    scope.value = initialValue;

    var element = angular.element('<opl-slider ng-model="value" opl-step="10"></opl-slider>');
    $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.equal(scope.value, 40, 'Wrong value');
  });

  it('should set value to 0 if inferior to 0', function() {
    scope.value = -42;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.equal(scope.value, 0, 'Wrong value');
  });

  it('should set value to 100 if superior to 100', function() {
    scope.value = 142;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.equal(scope.value, 100, 'Wrong value');
  });

  it('should be considered as not empty even if value is 0', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.notOk(element.controller('ngModel').$isEmpty(), 'Expected slider to be non empty');
  });

  it('should set class "opl-slider-focus" when receiving focus', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

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
    $timeout.flush(1000);

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
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.DOWN);
    scope.$apply();

    assert.ok(sliderElement.hasClass('opl-slider-active'), 'Expected class "opl-slider-active"');
  });

  it('should remove class "opl-slider-active" when released', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ng-model="value"></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.UP);
    scope.$apply();

    assert.notOk(sliderElement.hasClass('opl-slider-active'), 'Unexpected class "opl-slider-active"');
  });

  it('should set human readable alternative text of the slider value to empty if not defined', function() {
    scope.value = 50;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    assert.isEmpty(
      angular.element(element[0].querySelector('.opl-slider')).attr('aria-valuetext'),
      'Wrong human readable alternative text'
    );
  });

  it('should set the "aria-valuenow" attribute as the slider value changes', function() {
    scope.value = 0;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    assert.equal(
      sliderElement.attr('aria-valuenow'),
      scope.value,
      'Wrong aria-valuenow value'
    );

    scope.value = 42;
    scope.$digest();
    $timeout.flush(1000);

    assert.equal(
      sliderElement.attr('aria-valuenow'),
      scope.value,
      'Wrong aria-valuenow value'
    );
  });

  it('should call function defined in attribute "opl-on-focus" when focused', function() {
    scope.value = 42;
    scope.handleOnFocus = chai.spy(function() {});

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-on-focus="handleOnFocus()" ' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler('focus');

    scope.handleOnFocus.should.have.been.called.exactly(1);
  });

  it('should call function defined in attribute "opl-on-over" when pointer enters the slider', function() {
    scope.value = 42;
    scope.handleOnOver = chai.spy(function() {});

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-on-over="handleOnOver()" ' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OVER);

    scope.handleOnOver.should.have.been.called.exactly(1);
  });

  it('should call function defined in attribute "opl-on-out" when pointer leaves the slider', function() {
    scope.value = 42;
    scope.handleOnOut = chai.spy(function() {});

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-on-over="handleOnOut()" ' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OVER);
    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OUT);

    scope.handleOnOut.should.have.been.called.exactly(1);
  });

  it('should call function defined in attribute "opl-on-move" when pointer moves over the slider', function() {
    var sliderElementBoundingRectangle;
    var expectedCoordinates = {};

    scope.value = 42;
    scope.handleOnMove = chai.spy(function(value, coordinates, sliderBoundingRectangle) {
      assert.equal(
        value,
        ((coordinates.x - sliderElementBoundingRectangle.left) / sliderElementBoundingRectangle.width) * 100,
        'Wrong value'
      );
      assert.deepEqual(sliderBoundingRectangle, sliderElementBoundingRectangle, 'Wrong bounding rectangle');
      assert.equal(coordinates.x, expectedCoordinates.x, 'Wrong x coordinate');
      assert.equal(coordinates.y, expectedCoordinates.y, 'Wrong y coordinate');
    });

    var element = angular.element('<opl-slider ' +
                                  'id="opl-slider-test" ' +
                                  'ng-model="value" ' +
                                  'opl-on-move="handleOnMove(value, coordinates, sliderBoundingRectangle)" ' +
                                  '></opl-slider>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);

    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElementBoundingRectangle = sliderElement[0].getBoundingClientRect();
    expectedCoordinates.x = sliderElementBoundingRectangle.left + 100;
    expectedCoordinates.y = sliderElementBoundingRectangle.top + 20;

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OVER);
    bodyElement.triggerHandler({
      type: oplEventsFactory.EVENTS.MOVE,
      pageX: expectedCoordinates.x,
      pageY: expectedCoordinates.y
    });
    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OUT);

    scope.handleOnMove.should.have.been.called.exactly(1);
  });

  it('should be able to drag & drop the cursor', function() {
    var sliderElementBoundingRectangle;
    var expectedCoordinates = {};

    scope.value = 42;

    var element = angular.element('<opl-slider ' +
                                  'id="opl-slider-test" ' +
                                  'ng-model="value" ' +
                                  '></opl-slider>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);

    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    sliderElementBoundingRectangle = sliderElement[0].getBoundingClientRect();
    expectedCoordinates.x = sliderElementBoundingRectangle.left + 100;
    expectedCoordinates.y = sliderElementBoundingRectangle.top + 20;

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.DOWN);
    bodyElement.triggerHandler({
      type: oplEventsFactory.EVENTS.MOVE,
      pageX: expectedCoordinates.x,
      pageY: expectedCoordinates.y
    });
    sliderElement.triggerHandler(oplEventsFactory.EVENTS.UP);

    assert.equal(
      scope.value,
      ((expectedCoordinates.x - sliderElementBoundingRectangle.left) / sliderElementBoundingRectangle.width) * 100,
      'Wrong value'
    );
  });

  it('should set class "opl-over" when pointer is over the slider and remove it when pointer comes out', function() {
    scope.value = 42;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OVER);

    assert.ok(sliderElement.hasClass('opl-over'), 'Expected class "opl-over"');

    sliderElement.triggerHandler(oplEventsFactory.EVENTS.OUT);

    assert.notOk(sliderElement.hasClass('opl-over'), 'Unexpected class "opl-over"');
  });

  it('should be able to change the step dynamically', function() {
    var initialValue = 40;
    scope.value = initialValue;
    scope.step = 10;

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-step="{{step}}"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    scope.$digest();
    initialValue += 10;

    assert.equal(scope.value, initialValue, 'Wrong value after step 10');

    scope.step = 2;
    scope.$digest();

    sliderElement.triggerHandler({type: 'keydown', keyCode: 38});
    scope.$digest();
    initialValue += 2;

    assert.equal(scope.value, initialValue, 'Wrong value after step 2');
  });

  it('should be able to change the ARIA label dynamically', function() {
    scope.value = 42;
    scope.label = 'Default label';

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-label="{{label}}"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    scope.label = 'Modified label';
    scope.$digest();

    assert.equal(sliderElement.attr('aria-label'), scope.label, 'Wrong ARIA label');
  });

  it('should be able to change the ARIA valuetext dynamically', function() {
    scope.value = 42;
    scope.valueText = 'Default value text';

    var element = angular.element('<opl-slider ' +
                                  'ng-model="value" ' +
                                  'opl-value-text="{{valueText}}"' +
                                  '></opl-slider>');
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));

    scope.valueText = 'Modified value text';
    scope.$digest();

    assert.equal(sliderElement.attr('aria-valuetext'), scope.valueText, 'Wrong ARIA value text');
  });

  it('should update the slider when window is resized', function() {
    var intialValue = 42;
    scope.value = intialValue;

    var element = angular.element('<opl-slider ' +
                                  'id="opl-slider-test" ' +
                                  'ng-model="value" ' +
                                  '></opl-slider>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);

    scope.$digest();
    $timeout.flush(1000);

    var sliderElement = angular.element(element[0].querySelector('.opl-slider'));
    var thumbElement = angular.element(element[0].querySelector('.opl-slider-thumb-container'));
    var sliderElementBoundingRectangle = sliderElement[0].getBoundingClientRect();

    assert.equal(scope.value, intialValue, 'Wrong initial value');

    element.attr('style', 'width: 500px;');
    sliderElement.attr('style', 'width: 500px;');
    angular.element(window).triggerHandler('resize');

    var thumbPosition = (scope.value / 100) * sliderElementBoundingRectangle.width;
    assert.equal(scope.value, intialValue, 'Wrong value after resize');
    assert.match(
      thumbElement.attr('style'),
      new RegExp('translateX\\(' + thumbPosition + 'px\\)'),
      'Wrong thumb position'
    );
  });

});
