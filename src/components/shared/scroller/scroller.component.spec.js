'use strict';

window.assert = chai.assert;

describe('OplScroller', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var scope;
  var element;
  var scrollerElement;
  var scrollbarElement;
  var thumbElement;
  var contentWrapperElement;
  var bodyElement;
  var ctrl;
  var containerWidth = 1000;
  var containerHeight = 1000;
  var scrollbars = [
    {
      orientation: 'horizontal',
      scrollProperty: 'scrollLeft',
      sizeProperty: 'width',
      scaleProperty: 'scaleY',
      translateFunction: 'translateX',
      directionProperty: 'left',
      pagePositionProperty: 'pageX',
      overflowProperty: 'overflow-x',
      backwardKey: 37,
      forwardKey: 39
    },
    {
      orientation: 'vertical',
      scrollProperty: 'scrollTop',
      sizeProperty: 'height',
      scaleProperty: 'scaleX',
      translateFunction: 'translateY',
      directionProperty: 'top',
      pagePositionProperty: 'pageY',
      overflowProperty: 'overflow-y',
      backwardKey: 38,
      forwardKey: 40
    }
  ];

  // Load modules
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$document_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $document = _$document_;
  }));

  // Mock component style
  beforeEach(function() {
    var style = 'body {width: ' + containerWidth + 'px; height: ' + containerHeight + 'px;}' +
      'opl-scroller,.opl-scroller {position: relative;width: 100%; height: 100%;}' +
      '.opl-thumb {position: absolute;}' +
      '.opl-scroller-content {overflow: hidden; width: 100%; height: 100%;}';

    var styleElement = $document[0].createElement('style');
    styleElement.setAttribute('id', 'opl-scroller-test-style');
    styleElement.appendChild($document[0].createTextNode(style));
    $document[0].head.appendChild(styleElement);
  });

  afterEach(function() {
    $document[0].head.removeChild($document[0].head.querySelector('#opl-scroller-test-style'));
  });

  scrollbars.forEach(function(scrollbar) {

    describe(scrollbar.orientation, function() {

      // Initializes tests
      beforeEach(function() {
        scope = $rootScope.$new();
        scope.contentId = 'content-id';
        scope.content = 'Content to scroll';
        scope.contentSize = 8000;
        scope.containerSize = (scrollbar.orientation === 'horizontal') ? containerWidth : containerHeight;
        scope.orientation = scrollbar.orientation;
        scope.deactivated = false;
        scope.noSequentialFocus = false;
        scope.expectOnTouchHandler = chai.spy(function() {});
        scope.expectOnReadyHandler = chai.spy(function() {});
        scope.value = 42;
        scope.step = 10;

        element = angular.element('<opl-scroller ' +
                                    'id="opl-scroller-test" ' +
                                    'ng-model="value" ' +
                                    'opl-id="{{contentId}}" ' +
                                    'opl-step="{{step}}"' +
                                    'opl-no-sequential-focus="{{noSequentialFocus}}"' +
                                    'opl-deactivated="deactivated"' +
                                    'opl-orientation="{{orientation}}"' +
                                    'opl-on-touch="expectOnTouchHandler()"' +
                                    'opl-on-ready="expectOnReadyHandler()"' +
                                  '>' +
                                    '<div style="{{\'' + scrollbar.sizeProperty + ': \' + contentSize + \'px;\'}}">' +
                                      '{{content}}' +
                                    '</div>' +
                                  '</opl-scroller>');

        $document[0].body.appendChild(element[0]);

        element = $compile(element)(scope);
        scope.$digest();
        $timeout.flush();

        scrollerElement = angular.element(element[0].querySelector('.opl-scroller'));
        scrollbarElement = angular.element(element[0].querySelector('.opl-scrollbar'));
        thumbElement = angular.element(element[0].querySelector('.opl-thumb'));
        contentWrapperElement = angular.element(element[0].querySelector('.opl-scroller-content'));
        bodyElement = angular.element($document[0].body);

        ctrl = element.controller('oplScroller');
      });

      // Remove element from DOM
      afterEach(function() {
        $document[0].body.removeChild($document[0].body.querySelector('#opl-scroller-test'));
      });

      it('should display a scrollbar and the content to scroll', function() {
        var contentElement = angular.element(element[0].querySelector('#' + scope.contentId + ' > div'));
        var thumbSize = Number(
          window.getComputedStyle(thumbElement[0], null).getPropertyValue(scrollbar.sizeProperty).replace('px', '')
        );
        var thumbPosition = (scope.value / 100) * (scope.containerSize - thumbSize);
        var enlargeRegex = new RegExp(scrollbar.scaleProperty + '\\(1\\.[0-9]*\\)');
        var translateRegexp = new RegExp(scrollbar.translateFunction + '\\(' + thumbPosition + 'px\\)');

        assert.ok(scrollerElement.hasClass('opl-' + scrollbar.orientation), 'Wrong orientation class');
        assert.notOk(scrollerElement.hasClass('opl-no-scrollbar'), 'Unexpected deactivated class');
        assert.equal(scrollbarElement.attr('role'), 'scrollbar', 'Wrong role');
        assert.equal(scrollbarElement.attr('tabindex'), '0', 'Wrong tabindex');
        assert.equal(scrollbarElement.attr('aria-controls'), scope.contentId, 'Wrong aria-controls');
        assert.equal(scrollbarElement.attr('aria-value-min'), 0, 'Wrong aria-value-min');
        assert.equal(scrollbarElement.attr('aria-value-max'), 100, 'Wrong aria-value-max');
        assert.equal(scrollbarElement.attr('aria-orientation'), scope.orientation, 'Wrong aria-orientation');
        assert.equal(scrollbarElement.attr('aria-valuenow'), scope.value, 'Wrong aria-valuenow');
        assert.equal(contentElement.text(), scope.content, 'Wrong content');
        assert.equal(thumbSize, (scope.containerSize / scope.contentSize) * scope.containerSize, 'Wrong cursor size');
        assert.match(thumbElement.attr('style'), translateRegexp, 'Wrong cursor position');
        assert.notMatch(thumbElement.attr('style'), enlargeRegex, 'Unexpected enlargement');
        assert.notOk(thumbElement.hasClass('ng-hide'), 'Unexpected hidden thumb');
        assert.equal(
          ctrl.getScrollValue(),
          ((scope.value * (scope.contentSize - scope.containerSize)) / 100),
          'Wrong scroll position'
        );
        scope.expectOnReadyHandler.should.have.been.called.exactly(1);
      });

      it('should set class "opl-scroller-over" to the scroller element when pointer is over', function() {
        scrollerElement.triggerHandler('mouseover');

        assert.ok(scrollerElement.hasClass('opl-scroller-over'), 'Expected class "opl-scroller-over"');

        scrollerElement.triggerHandler('mouseout');

        assert.notOk(scrollerElement.hasClass('opl-scroller-over'), 'Unexpected class "opl-scroller-over"');
      });

      it('should set class "opl-thumb-over" to the cursor element and enlarge it when pointer is over', function() {
        var enlargeRegex = new RegExp(scrollbar.scaleProperty + '\\(1\\.[0-9]*\\)');

        thumbElement.triggerHandler('mouseover');

        assert.ok(thumbElement.hasClass('opl-thumb-over'), 'Expected class "opl-thumb-over"');
        assert.match(thumbElement.attr('style'), enlargeRegex, 'Expected cursor to be enlarged');

        thumbElement.triggerHandler('mouseout');

        assert.notMatch(thumbElement.attr('style'), enlargeRegex, 'Expected cursor to be normal');
        assert.notOk(thumbElement.hasClass('opl-thumb-over'), 'Unexpected class "opl-thumb-over"');
      });

      it('should set class "opl-thumb-active" to the cursor element when activated', function() {
        thumbElement.triggerHandler('mousedown');

        assert.ok(thumbElement.hasClass('opl-thumb-active'), 'Expected class "opl-thumb-active"');

        bodyElement.triggerHandler('mouseup');

        assert.notOk(thumbElement.hasClass('opl-thumb-active'), 'Unexpected class "opl-thumb-active"');
      });

      it('should call function defined in "opl-on-touch" attribute when used', function() {
        thumbElement.triggerHandler('mousedown');
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.forwardKey});
        scrollerElement.triggerHandler({type: 'wheel', deltaY: 42});

        scope.expectOnTouchHandler.should.have.been.called.exactly(3);
      });

      it('should be able to drag & drop the cursor', function() {
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
        var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];
        var thumbPagePosition = thumbElementBoundingRectangle[scrollbar.directionProperty];
        var thumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var variation = 100;
        var previousValue = scope.value;

        var mouseDownEvent = {type: 'mousedown'};
        var mouseMoveEvent = {type: 'mousemove'};
        var mouseUpEvent = {type: 'mouseup'};
        mouseDownEvent[scrollbar.pagePositionProperty] = thumbPagePosition;
        mouseMoveEvent[scrollbar.pagePositionProperty] = thumbPagePosition + variation;
        mouseUpEvent[scrollbar.pagePositionProperty] = thumbPagePosition + variation;
        thumbElement.triggerHandler(mouseDownEvent);
        bodyElement.triggerHandler(mouseMoveEvent);
        bodyElement.triggerHandler(mouseUpEvent);

        assert.equal(
          Math.round(((variation / (contentWrapperSize - thumbSize)) * 100) + previousValue),
          Math.round(scope.value),
          'Wrong value'
        );
        assert.equal(
          thumbPagePosition + variation,
          thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty],
          'Wrong thumb position'
        );
      });

      it('should not replace the cursor left edge to the pointer position when dragging', function() {
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
        var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];
        var thumbPagePosition = thumbElementBoundingRectangle[scrollbar.directionProperty];
        var thumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var variation = 100;
        var positionOnThumb = thumbSize / 2;
        var previousValue = scope.value;

        var mouseDownEvent = {type: 'mousedown'};
        var mouseMoveEvent = {type: 'mousemove'};
        var mouseUpEvent = {type: 'mouseup'};
        mouseDownEvent[scrollbar.pagePositionProperty] = thumbPagePosition + positionOnThumb;
        mouseMoveEvent[scrollbar.pagePositionProperty] = thumbPagePosition + positionOnThumb + variation;
        mouseUpEvent[scrollbar.pagePositionProperty] = thumbPagePosition + positionOnThumb + variation;
        thumbElement.triggerHandler(mouseDownEvent);
        bodyElement.triggerHandler(mouseMoveEvent);
        bodyElement.triggerHandler(mouseUpEvent);

        assert.equal(
          Math.round(((variation / (contentWrapperSize - thumbSize)) * 100) + previousValue),
          Math.round(scope.value),
          'Wrong value'
        );
        assert.equal(
          thumbPagePosition + variation,
          thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty],
          'Wrong thumb position'
        );
      });

      it('should update the scroller when window is resized', function() {
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var initialThumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var initialThumbPosition = thumbElementBoundingRectangle[scrollbar.directionProperty];

        contentWrapperElement.attr('style', scrollbar.sizeProperty + ': 800px;');
        angular.element(window).triggerHandler('resize');
        $timeout.flush();

        thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        assert.ok(initialThumbSize > thumbElementBoundingRectangle[scrollbar.sizeProperty], 'Wrong thumb size');
        assert.ok(
          initialThumbPosition > thumbElementBoundingRectangle[scrollbar.directionProperty],
          'Wrong thumb position'
        );
      });

      it('should set class "opl-scroller-focus" to the scroller element when scrollbar is focused', function() {
        scrollbarElement.triggerHandler('focus');

        assert.ok(scrollerElement.hasClass('opl-scroller-focus'), 'Expected class "opl-scroller-focus"');

        scrollbarElement.triggerHandler('blur');

        assert.notOk(scrollerElement.hasClass('opl-scroller-focus'), 'Unexpected class "opl-scroller-focus"');
      });

      it('should be able to move the cursor using arrow keys', function() {
        var thumbElementPosition;
        var contentWrapperElementPosition;
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
        var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];
        var thumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var initialValue = scope.value;

        // Forward
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.forwardKey});

        initialValue += scope.step;
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, initialValue, 'Wrong value after forward');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          (initialValue / 100) * (contentWrapperSize - thumbSize),
          'Wrong cursor position after forward'
        );

        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.backwardKey});

        initialValue -= scope.step;
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, initialValue, 'Wrong value after backward');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          (initialValue / 100) * (contentWrapperSize - thumbSize),
          'Wrong cursor position after backward'
        );
      });

      it('should be able to scroll to 100% using "End" key', function() {
        var thumbElementPosition;
        var contentWrapperElementPosition;
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
        var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];
        var thumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];

        scrollbarElement.triggerHandler({type: 'keydown', keyCode: 35});
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, 100, 'Wrong value');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          contentWrapperSize - thumbSize,
          'Wrong cursor position'
        );
      });

      it('should be able to scroll to 0% using "Home" key', function() {
        var thumbElementPosition;
        var contentWrapperElementPosition;
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: 36});

        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, 0, 'Wrong value');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          0,
          'Wrong cursor position'
        );
      });

      it('should be able to scroll using pointer wheel', function() {
        var thumbElementPosition;
        var contentWrapperElementPosition;
        var variation = 100;
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
        var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];
        var thumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var initialValue = scope.value;

        // Forward
        scrollerElement.triggerHandler({type: 'wheel', deltaY: variation});

        initialValue += ((variation / (scope.contentSize - contentWrapperSize)) * 100);
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, initialValue, 'Wrong value after wheel down');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          Math.round((initialValue / 100) * (contentWrapperSize - thumbSize)),
          'Wrong cursor position after wheel down'
        );

        // Backward
        scrollerElement.triggerHandler({type: 'wheel', deltaY: -variation});

        initialValue -= ((variation / (scope.contentSize - contentWrapperSize)) * 100);
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, initialValue, 'Wrong value after wheel up');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          (initialValue / 100) * (contentWrapperSize - thumbSize),
          'Wrong cursor position after wheel up'
        );
      });

      it(
      'should move the cursor by a step of 1 when using arrow keys without setting "opl-step" attribute',
      function() {
        var thumbElementPosition;
        var contentWrapperElementPosition;
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
        var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];
        var thumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var initialValue = scope.value;

        scope.step = null;
        scope.$digest();

        // Forward
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.forwardKey});

        initialValue += 1;
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, initialValue, 'Wrong value after forward');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          (initialValue / 100) * (contentWrapperSize - thumbSize),
          'Wrong cursor position after forward'
        );

        // Backward
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.backwardKey});

        initialValue -= 1;
        thumbElementPosition = thumbElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        contentWrapperElementPosition = contentWrapperElement[0].getBoundingClientRect()[scrollbar.directionProperty];
        assert.equal(scope.value, initialValue, 'Wrong value after backward');
        assert.equal(
          thumbElementPosition - contentWrapperElementPosition,
          (initialValue / 100) * (contentWrapperSize - thumbSize),
          'Wrong cursor position after backward'
        );
      });

      it('should be able to force the scroller to update', function() {
        var thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        var initialThumbSize = thumbElementBoundingRectangle[scrollbar.sizeProperty];
        var initialThumbPosition = thumbElementBoundingRectangle[scrollbar.directionProperty];

        contentWrapperElement.attr('style', scrollbar.sizeProperty + ': 800px;');
        ctrl.reset();
        $timeout.flush();

        thumbElementBoundingRectangle = thumbElement[0].getBoundingClientRect();
        assert.ok(initialThumbSize > thumbElementBoundingRectangle[scrollbar.sizeProperty], 'Wrong thumb size');
        assert.ok(
          initialThumbPosition > thumbElementBoundingRectangle[scrollbar.directionProperty],
          'Wrong thumb position'
        );
      });

      it('should be able to deactivate the scroller using "opl-deactivated" attribute', function() {
        assert.notOk(scrollerElement.hasClass('opl-no-scrollbar'), 'Unexpected deactivated class');
        assert.notOk(thumbElement.hasClass('ng-hide'), 'Unexpected hidden thumb');

        scope.deactivated = true;
        scope.$digest();

        assert.ok(scrollerElement.hasClass('opl-no-scrollbar'), 'Expected deactivated class');
        assert.ok(thumbElement.hasClass('ng-hide'), 'Expected hidden thumb');
      });

      it('should not be able to use the scroller if deactivated', function() {
        var initialValue = scope.value;

        scope.deactivated = true;
        scope.$digest();

        var mouseDownEvent = {type: 'mousedown'};
        var mouseMoveEvent = {type: 'mousemove'};
        var mouseUpEvent = {type: 'mouseup'};
        mouseMoveEvent[scrollbar.pagePositionProperty] = 100;
        mouseUpEvent[scrollbar.pagePositionProperty] = 100;
        thumbElement.triggerHandler(mouseDownEvent);
        bodyElement.triggerHandler(mouseMoveEvent);
        bodyElement.triggerHandler(mouseUpEvent);
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.forwardKey});
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: scrollbar.backwardKey});
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: 35});
        scrollbarElement.triggerHandler({type: 'keydown', keyCode: 36});
        scrollerElement.triggerHandler({type: 'wheel', deltaY: 100});

        assert.ok(scope.value, initialValue, 'Wrong value');
      });

      it('should not be able to set a negative value', function() {
        scope.value = -42;
        scope.$digest();
        assert.equal(scope.value, 0, 'Wrong value');
      });

      it('should not be able to set a value greater than 100', function() {
        scope.value = 142;
        scope.$digest();
        assert.equal(scope.value, 100, 'Wrong value');
      });

      describe('focus', function() {

        it('should focus the scrollbar element', function() {
          scrollbarElement[0].focus = chai.spy(scrollbarElement[0].focus);
          ctrl.focus();
          scrollbarElement[0].focus.should.have.been.called.exactly(1);
        });

      });

      describe('isFocused', function() {

        it('should return true if scroller is focused and false otherwise', function() {
          assert.notOk(ctrl.isFocused(), 'Expected scroller to be unfocused');

          scrollbarElement.triggerHandler('focus');

          assert.ok(ctrl.isFocused(), 'Expected scroller to be focused');
        });

      });

      describe('getScrollValue', function() {

        it('should return the scroll value in pixels', function() {
          var contentWrapperElementBoundingRectangle = contentWrapperElement[0].getBoundingClientRect();
          var contentWrapperSize = contentWrapperElementBoundingRectangle[scrollbar.sizeProperty];

          assert.equal(
            ctrl.getScrollValue(),
            (scope.value * (scope.contentSize - contentWrapperSize)) / 100,
            'Wrong scroll value'
          );
        });

      });

      describe('getContentSize', function() {

        it('should return the scrolled content size', function() {
          assert.equal(ctrl.getContentSize(), scope.contentSize, 'Wrong content size');
        });

      });

    });

    describe('on touch devices', function() {

      beforeEach(function() {
        window.ontouchstart = true;
        scope = $rootScope.$new();
        scope.contentId = 'content-id';
        scope.content = 'Content to scroll';
        scope.orientation = scrollbar.orientation;
        scope.value = 42;

        element = angular.element('<opl-scroller ' +
                                                'ng-model="value" ' +
                                                'opl-id="{{contentId}}" ' +
                                                'opl-orientation="{{orientation}}"' +
                                  '>' +
                                    '<div>{{content}}</div>' +
                                  '</opl-scroller>');

        element = $compile(element)(scope);
        scope.$digest();

        contentWrapperElement = angular.element(element[0].querySelector('.opl-scroller-content'));

      });

      afterEach(function() {
        delete window.ontouchstart;
      });

      it('should let the device handle the scrollbar', function() {
        var overflowRegExp = new RegExp(scrollbar.overflowProperty + ': ?scroll');
        assert.match(contentWrapperElement.attr('style'), overflowRegExp, 'Expected device scrollbar');
      });

    });

  });

});
