'use strict';

window.assert = chai.assert;

describe('OplTiles', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var $httpBackend;
  var scope;
  var element;
  var TileController;
  var ScrollerController;
  var originalRequestAnimationFrame;
  var base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP' +
    '//////////////////////////////////////////////////////////////////////////////////////' +
    '2wBDAf//////////////////////////////////////////////////////////////////////////////////////' +
    'wgARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAAv/EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAUf' +
    '/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAn//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//' +
    'xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/An//' +
    'xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IX//2gAMAwEAAgADAAAAEB//xAAUEQEAAAAAAAAAAAAAAAAAAAAA' +
    '/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2Q==';

  // Load modules
  beforeEach(function() {
    TileController = function() {
      if (this.oplOnReady) this.oplOnReady();
    };
    TileController.prototype.preload = chai.spy(function() {});
    TileController.prototype.reset = chai.spy(function() {});
    TileController.prototype.focus = chai.spy(function() {});
    TileController.prototype.isFocused = chai.spy(function() {});
    TileController.prototype.getTileHeight = chai.spy(function() {
      return 800;
    });

    ScrollerController = function() {};
    ScrollerController.prototype.reset = chai.spy(function() {});
    ScrollerController.prototype.getScrollValue = chai.spy(function() {
      return 0;
    });
    ScrollerController.prototype.setScrollValue = chai.spy(function(value) {});

    module('templates');
    module('ov.player', function($controllerProvider, $provide) {

      // Mock scroller and tile controllers
      $controllerProvider.register('OplTileController', TileController);
      $controllerProvider.register('OplScrollerController', ScrollerController);

    });

    // Mock requestAnimationFrame
    originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      callback();
    };
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$document_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $document = _$document_;
    $httpBackend = _$httpBackend_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
    scope.tileWidth = 100;
    scope.tileHeight = 50;
    scope.containerWidth = 1000;
    scope.containerHeight = 1000;
    scope.data = [
      {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>'
      },
      {
        id: 2,
        type: 'image',
        time: 40000,
        image: {
          small: 'image-small.jpg',
          large: 'image-large.jpg'
        }
      },
      {
        id: 3,
        type: 'text',
        title: 'Title',
        time: 60000,
        description: '<h1>Description</h1>'
      }
    ];
    scope.time = 42000;
    $httpBackend.whenGET(scope.data[1].image.small).respond(200);
  });

  // Mock component style
  beforeEach(function() {
    var style = 'body {width: ' + scope.containerWidth + 'px; height: ' + scope.containerHeight + 'px;}' +
      'opl-tiles,.opl-tiles {position: relative;overflow: hidden; width: 100%; height: 100%;}' +
      '.opl-tiles .opl-tile-wrapper {width: ' + scope.tileWidth + 'px;height: ' + scope.tileHeight + 'px;}';

    var styleElement = $document[0].createElement('style');
    styleElement.setAttribute('id', 'opl-tiles-test-style');
    styleElement.appendChild($document[0].createTextNode(style));
    $document[0].head.appendChild(styleElement);
  });

  afterEach(function() {
    var componentElement = $document[0].body.querySelector('#opl-tiles-test');
    $document[0].head.removeChild($document[0].head.querySelector('#opl-tiles-test-style'));
    if (componentElement) $document[0].body.removeChild(componentElement);
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it('should be able to display a scrollable list of tiles', function() {
    var preloadCount = 0;
    var resetCount = 0;
    TileController.prototype.preload = chai.spy(function() {
      assert.equal(this.oplData.id, scope.data[preloadCount].id, 'Unexpected preload of tile ' + preloadCount);
      preloadCount++;
    });
    TileController.prototype.reset = chai.spy(function() {
      assert.equal(this.oplData.id, scope.data[resetCount].id, 'Unexpected reset of tile ' + resetCount);
      resetCount++;
    });

    scope.time = 42000;
    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));
    var scrollerElement = angular.element(element[0].querySelector('.opl-tiles > opl-scroller'));
    var tilesWrapperElement = angular.element(element[0].querySelector('.opl-tiles-content'));
    var tileElements = angular.element(element[0].querySelectorAll('.opl-tiles-content > ul > li'));
    var focusedTileIndex = 1;

    assert.equal(tilesElement.attr('tabindex'), 0, 'Wrong tabindex');
    assert.equal(scrollerElement.attr('opl-no-sequential-focus'), 'true', 'Wrong scroller focus policy');
    assert.equal(scrollerElement.attr('opl-orientation'), 'horizontal', 'Wrong scroller orientation');
    assert.lengthOf(tileElements, scope.data.length, 'Wrong number of tiles');
    assert.match(
      tilesWrapperElement.attr('style'),
      new RegExp('width: ?' + (scope.tileWidth * tileElements.length + tileElements.length * 8 + 8) + 'px'),
      'Wrong wrapper width'
    );

    for (var i = 0; i < tileElements.length; i++) {
      var tileElement = angular.element(tileElements[i]);
      var tileXPosition = ((i + 1) * 8) + (i * scope.tileWidth);

      assert.equal(tileElement.attr('data-id'), scope.data[i].id, 'Wrong id for tile ' + i);
      assert.match(
        tileElement.attr('style'),
        new RegExp('translateX\\(' + tileXPosition + 'px\\)'), 'Wrong x position for tile ' + i
      );
      assert.match(tileElement.attr('style'), /translateY\(0\)/, 'Wrong y position for tile ' + i);
      assert.match(
        tileElement.attr('style'),
        new RegExp('--opl-tiles-reduced-xpos: ?' + tileXPosition + 'px'),
        'Wrong reduced x position for tile ' + i
      );
      assert.match(
        tileElement.attr('style'),
        /--opl-tiles-reduced-ypos: ?0px/,
        'Wrong reduced y position for tile ' + i
      );

      if (i === focusedTileIndex) {
        assert.ok(tileElement.hasClass('opl-selected'), 'Expected class "opl-selected" for tile ' + i);
        assert.notOk(tileElement.hasClass('opl-past'), 'Unexpected class "opl-past" for tile ' + i);
      } else if (scope.data[i].time < scope.time) {
        assert.ok(tileElement.hasClass('opl-past'), 'Expected class "opl-past" for tile ' + i);
        assert.notOk(tileElement.hasClass('opl-selected'), 'Unexpected class "opl-selected" for tile ' + i);
      } else {
        assert.notOk(tileElement.hasClass('opl-past'), 'Unexpected class "opl-past" for tile ' + i);
        assert.notOk(tileElement.hasClass('opl-selected'), 'Unexpected class "opl-selected" for tile ' + i);
      }
    }

    TileController.prototype.preload.should.have.been.called.exactly(tileElements.length);
    ScrollerController.prototype.reset.should.have.been.called.exactly(1);
  });

  it('should set class "opl-focus" when focused and focus the first tile', function() {
    TileController.prototype.focus = chai.spy(function() {
      assert.equal(this.oplData.id, scope.data[0].id, 'Wrong tile');
    });

    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));

    tilesElement.triggerHandler('focus');

    assert.ok(tilesElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

    tilesElement.triggerHandler('blur');

    assert.notOk(tilesElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
    TileController.prototype.focus.should.have.been.called.exactly(1);
  });

  it('should move focus among tiles when using keys', function() {
    scope.data = [
      {
        id: 1,
        type: 'text',
        time: 20000,
        title: 'Title 1'
      },
      {
        id: 2,
        type: 'text',
        time: 40000,
        title: 'Title 2'
      },
      {
        id: 3,
        type: 'text',
        time: 60000,
        title: 'Title 3'
      }
    ];

    var focusedIndex = 0;
    var expectedFocusedTileIndex = 0;
    TileController.prototype.focus = chai.spy(function() {
      assert.equal(this.oplData.id, scope.data[expectedFocusedTileIndex].id, 'Wrong focused tile');
    });
    TileController.prototype.isFocused = chai.spy(function() {
      return this.oplData.id === scope.data[focusedIndex].id;
    });

    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));

    // Next
    expectedFocusedTileIndex = 1;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 39});
    focusedIndex = 1;

    // Next
    expectedFocusedTileIndex = 2;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 40});
    focusedIndex = 2;

    // Next
    expectedFocusedTileIndex = 0;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 40});
    focusedIndex = 0;

    // Previous
    expectedFocusedTileIndex = 2;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 37});
    focusedIndex = 2;

    // Previous
    expectedFocusedTileIndex = 1;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 38});
    focusedIndex = 1;

    // Begin
    expectedFocusedTileIndex = 0;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 36});
    focusedIndex = 0;

    // End
    expectedFocusedTileIndex = 2;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 35});
    focusedIndex = 2;

    TileController.prototype.focus.should.have.been.called.exactly(7);
  });

  it('should preload only visible tiles when initializing', function() {
    var expectedNumberOfVisibleTiles = scope.containerWidth / scope.tileWidth;
    var count = 0;
    TileController.prototype.preload = chai.spy(function() {
      if (count > expectedNumberOfVisibleTiles)
        assert.ok(false, 'Unexpected preloading of tile ' + count);
      else
        assert.equal(this.oplData.id, scope.data[count].id, 'Wrong preloaded tile');
      count++;
    });

    scope.data = [];

    for (var i = 0; i < 50; i++) {
      scope.data.push({
        id: i + 1,
        type: 'text',
        time: String(1000 * i),
        title: 'Title ' + i
      });
    }

    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);
  });

  it('should preload new visible tiles when focusing next tile using arrow keys', function() {
    var expectedNumberOfVisibleTiles = Math.round(scope.containerWidth / (scope.tileWidth + 8));
    var count = 0;
    var expectedScrollValue = 0;
    var totalTiles = 50;

    TileController.prototype.preload = chai.spy(function() {
      if (count > count + expectedNumberOfVisibleTiles)
        assert.ok(false, 'Unexpected preloading of tile ' + count);
      else
        assert.equal(this.oplData.id, scope.data[count].id, 'Wrong preloaded tile ' + count);

      count++;
    });

    // Mock scroll position as we don't really focus tile elements, consequently the scroller isn't moving
    ScrollerController.prototype.getScrollValue = chai.spy(function() {
      return expectedScrollValue;
    });

    scope.data = [];

    for (var i = 0; i < totalTiles; i++) {
      scope.data.push({
        id: i + 1,
        type: 'text',
        time: String(1000 * i),
        title: 'Title ' + i
      });
    }

    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));

    // Next
    count = 1;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 39});

    // Next
    count = 2;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 39});

    // Previous
    count = 1;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 37});

    // Begin
    count = 0;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 36});

    // End
    count = totalTiles - expectedNumberOfVisibleTiles;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    tilesElement.triggerHandler({type: 'keydown', keyCode: 35});

    TileController.prototype.preload.should.have.been.called.exactly(expectedNumberOfVisibleTiles * 5);
  });

  it('should only be able to focus the enlarged tile when using keys if a tile is enlarged', function() {
    scope.data = [
      {
        id: 1,
        type: 'text',
        time: 20000,
        title: 'Title 1'
      },
      {
        id: 2,
        type: 'text',
        time: 40000,
        title: 'Title 2'
      },
      {
        id: 3,
        type: 'text',
        time: 60000,
        title: 'Title 3'
      }
    ];

    var focusedIndex = 0;
    var expectedFocusedTileIndex = 0;
    TileController.prototype.focus = chai.spy(function() {
      assert.equal(this.oplData.id, scope.data[expectedFocusedTileIndex].id, 'Wrong focused tile');
    });
    TileController.prototype.isFocused = chai.spy(function() {
      return this.oplData.id === scope.data[focusedIndex].id;
    });

    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));
    var ctrl = element.controller('oplTiles');

    ctrl.enlargeTile(scope.data[0].id);
    $timeout.flush(1000);

    // Next
    tilesElement.triggerHandler({type: 'keydown', keyCode: 39});
    focusedIndex = 1;

    // Previous
    tilesElement.triggerHandler({type: 'keydown', keyCode: 37});
    focusedIndex = 0;

    // Home
    tilesElement.triggerHandler({type: 'keydown', keyCode: 36});
    focusedIndex = 2;

    // End
    tilesElement.triggerHandler({type: 'keydown', keyCode: 35});
    focusedIndex = 0;
  });

  it('should reset the component when the window is resized', function() {
    var newWidth = 200;
    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));
    var totalPreloadCalls = Math.min(Math.round(scope.containerWidth / (scope.tileWidth + 8)), scope.data.length);

    tilesElement.attr('style', 'width: ' + newWidth + 'px;');
    angular.element(window).triggerHandler('resize');
    $timeout.flush(1000);
    totalPreloadCalls += Math.min(Math.round(newWidth / (scope.tileWidth + 8)), scope.data.length);

    ScrollerController.prototype.reset.should.have.been.called.exactly(2);
    TileController.prototype.reset.should.have.been.called.exactly(scope.data.length * 2);
    TileController.prototype.preload.should.have.been.called.exactly(totalPreloadCalls);
  });

  it('should call function defined in attribute "opl-on-tile-select" when a tile is selected', function() {
    var expectedTileIndex = 0;
    scope.handleOnTileSelect = chai.spy(function(tile) {
      assert.strictEqual(tile, scope.data[expectedTileIndex], 'Wrong tile');
    });
    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                                'opl-on-tile-select="handleOnTileSelect(tile)"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var isolateScope = element.isolateScope();

    isolateScope.handleTileSelect(scope.data[expectedTileIndex]);

    scope.handleOnTileSelect.should.have.been.called.exactly(1);
  });

  it('should call function defined in attribute "opl-on-tile-info" when a tile "more info" is requested', function() {
    var expectedTileIndex = 0;
    scope.handleOnTileInfo = chai.spy(function(tile) {
      assert.strictEqual(tile, scope.data[expectedTileIndex], 'Wrong tile');
    });
    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                                'opl-on-tile-info="handleOnTileInfo(tile)"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var isolateScope = element.isolateScope();

    isolateScope.handleTileMoreInfo(scope.data[expectedTileIndex]);

    scope.handleOnTileInfo.should.have.been.called.exactly(1);
  });

  it('should call function defined in attribute "opl-on-tile-close" when tile close is requested', function() {
    var expectedTileIndex = 0;
    scope.handleOnTileClose = chai.spy(function(tile) {
      assert.strictEqual(tile, scope.data[expectedTileIndex], 'Wrong tile');
    });
    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                                'opl-on-tile-close="handleOnTileClose(tile)"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var isolateScope = element.isolateScope();

    isolateScope.handleTileClose(scope.data[expectedTileIndex]);

    scope.handleOnTileClose.should.have.been.called.exactly(1);
  });

  it('should preload visible tiles when scroll position changes', function() {
    var expectedNumberOfVisibleTiles = Math.round(scope.containerWidth / (scope.tileWidth + 8));
    var count = 0;
    var expectedScrollValue = 0;
    var totalTiles = 50;

    TileController.prototype.preload = chai.spy(function() {
      if (count > count + expectedNumberOfVisibleTiles)
        assert.ok(false, 'Unexpected preloading of tile ' + count);
      else
        assert.equal(this.oplData.id, scope.data[count].id, 'Wrong preloaded tile ' + count);

      count++;
    });

    // Mock scroll position as we don't really focus tile elements, consequently the scroller isn't moving
    ScrollerController.prototype.getScrollValue = chai.spy(function() {
      return expectedScrollValue;
    });

    scope.data = [];

    for (var i = 0; i < totalTiles; i++) {
      scope.data.push({
        id: i + 1,
        type: 'text',
        time: String(1000 * i)
      });
    }

    element = angular.element('<opl-tiles ' +
                                'id="opl-tiles-test"' +
                                'opl-data="data"' +
                                'opl-time="time"' +
                              '></opl-tiles>');
    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush(1000);

    var isolateScope = element.isolateScope();

    count = 1;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    isolateScope.handleScrollerChange();
    $timeout.flush(1000);

    count = 2;
    expectedScrollValue = (scope.tileWidth + 8) * count;
    isolateScope.handleScrollerChange();
    $timeout.flush(1000);

    TileController.prototype.preload.should.have.been.called.exactly(expectedNumberOfVisibleTiles * 3);
  });

  describe('enlargeTile', function() {

    it('should enlarge a tile of type "text"', function() {
      var expectedScrollValue = 0;
      var expectedEnlargedTileHeight = 100;

      TileController.prototype.getTileHeight = chai.spy(function() {
        return expectedEnlargedTileHeight;
      });

      scope.data = [
        {
          id: 1,
          type: 'text',
          time: 20000,
          title: 'Title 1'
        }
      ];
      element = angular.element('<opl-tiles ' +
                                  'id="opl-tiles-test"' +
                                  'opl-data="data"' +
                                  'opl-time="time"' +
                                '></opl-tiles>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush(1000);

      var ctrl = element.controller('oplTiles');
      var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));
      var tileElements = angular.element(element[0].querySelectorAll('.opl-tiles-content > ul > li'));
      var enlargedTileElement = angular.element(tileElements[0]);
      var enlargedXPosition = expectedScrollValue + 8;
      var enlargedYPosition = -((scope.containerHeight - (8 * 2) - 40) - expectedEnlargedTileHeight) / 2;
      var enlargedWidth = scope.containerWidth - 8 * 2;

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      assert.notOk(scope.data[0].abstract, 'Expected tile to be enlarged');
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-xpos: ?' + enlargedXPosition + 'px'),
        'Wrong enlarged x position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-ypos: ?' + enlargedYPosition + 'px'),
        'Wrong enlarged y position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-width: ?' + enlargedWidth + 'px'),
        'Wrong enlarged width'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-height: ?' + expectedEnlargedTileHeight + 'px'),
        'Wrong enlarged height'
      );

      assert.match(
        enlargedTileElement.attr('style'),
        /translateX\(var\(--opl-tiles-enlarged-xpos\)\)/,
        'Wrong tile x position'
      );
      assert.match(
        enlargedTileElement.attr('style'),
        /translateY\(var\(--opl-tiles-enlarged-ypos\)\)/,
        'Wrong tile y position'
      );
    });

    it('should enlarge a tile of type "image"', function() {
      var expectedScrollValue = 0;
      var expectedImageWidth = 150;
      var expectedImageHeight = 100;
      var expectedTileIndex = 0;

      TileController.prototype.focus = chai.spy(function() {
        assert.equal(this.oplData.id, scope.data[expectedTileIndex].id, 'Wrong tile');
      });

      scope.data = [
        {
          id: 2,
          type: 'image',
          time: 40000,
          image: {
            small: 'image-small.jpg',
            large: base64Image
          }
        }
      ];
      element = angular.element('<opl-tiles ' +
                                  'id="opl-tiles-test"' +
                                  'opl-data="data"' +
                                  'opl-time="time"' +
                                '></opl-tiles>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush(1000);

      var ctrl = element.controller('oplTiles');
      var isolateScope = element.isolateScope();
      var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));
      var tileElements = angular.element(element[0].querySelectorAll('.opl-tiles-content > ul > li'));
      var enlargedTileElement = angular.element(tileElements[0]);
      var enlargedXPosition = expectedScrollValue + 8;
      var enlargedYPosition = 0;
      var enlargedWidth = scope.containerWidth - 8 * 2;
      var enlargedHeight = scope.containerHeight - 8 * 2 - 40;

      var resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - expectedImageWidth) / 2;
      var resizedYPosition = -(enlargedHeight - expectedImageHeight) / 2;

      ctrl.enlargeTile(scope.data[expectedTileIndex].id);
      $timeout.flush(1000);

      assert.notOk(scope.data[expectedTileIndex].abstract, 'Expected tile to be enlarged');
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-xpos: ?' + enlargedXPosition + 'px'),
        'Wrong enlarged x position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-ypos: ?' + enlargedYPosition + 'px'),
        'Wrong enlarged y position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-width: ?' + enlargedWidth + 'px'),
        'Wrong enlarged width'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-height: ?' + enlargedHeight + 'px'),
        'Wrong enlarged height'
      );

      isolateScope.handleTileImagePreload(
        scope.data[expectedTileIndex],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-xpos: ?' + resizedXPosition + 'px'),
        'Wrong enlarged x position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-ypos: ?' + resizedYPosition + 'px'),
        'Wrong enlarged y position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-width: ?' + expectedImageWidth + 'px'),
        'Wrong enlarged width'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-enlarged-height: ?' + expectedImageHeight + 'px'),
        'Wrong enlarged height'
      );

      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-resized-xpos: ?' + resizedXPosition + 'px'),
        'Wrong resized x position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-resized-ypos: ?' + resizedYPosition + 'px'),
        'Wrong resized y position'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-resized-width: ?' + expectedImageWidth + 'px'),
        'Wrong resized width'
      );
      assert.match(
        tilesElement.attr('style'),
        new RegExp('--opl-tiles-resized-height: ?' + expectedImageHeight + 'px'),
        'Wrong resized height'
      );

      assert.match(
        enlargedTileElement.attr('style'),
        /translateX\(var\(--opl-tiles-enlarged-xpos\)\)/,
        'Wrong tile x position'
      );
      assert.match(
        enlargedTileElement.attr('style'),
        /translateY\(var\(--opl-tiles-enlarged-ypos\)\)/,
        'Wrong tile y position'
      );

      TileController.prototype.focus.should.have.been.called.exactly(1);
    });

    it('should respect the ratio of the image if image is too large for the available space', function() {
      var expectedScrollValue = 0;
      var enlargedWidth;
      var enlargedHeight;
      var resizedWidth;
      var resizedHeight;
      var resizedXPosition;
      var resizedYPosition;
      var containerWidth;
      var containerHeight;
      var expectedImageWidth;
      var expectedImageHeight;

      scope.data = [
        {
          id: 1,
          type: 'image',
          time: 10000,
          image: {
            small: 'image-small.jpg',
            large: base64Image
          }
        }
      ];
      element = angular.element('<opl-tiles ' +
                                  'id="opl-tiles-test"' +
                                  'opl-data="data"' +
                                  'opl-time="time"' +
                                '></opl-tiles>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush(1000);

      var ctrl = element.controller('oplTiles');
      var isolateScope = element.isolateScope();
      var tilesElement = angular.element(element[0].querySelector('.opl-tiles'));

      var validate = function(xPosition, yPosition, width, height) {
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-enlarged-xpos: ?' + xPosition + 'px'),
          'Wrong enlarged x position'
        );
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-enlarged-ypos: ?' + yPosition + 'px'),
          'Wrong enlarged y position'
        );
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-enlarged-width: ?' + width + 'px'),
          'Wrong enlarged width'
        );
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-enlarged-height: ?' + height + 'px'),
          'Wrong enlarged height'
        );

        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-resized-xpos: ?' + xPosition + 'px'),
          'Wrong resized x position'
        );
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-resized-ypos: ?' + yPosition + 'px'),
          'Wrong resized y position'
        );
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-resized-width: ?' + width + 'px'),
          'Wrong resized width'
        );
        assert.match(
          tilesElement.attr('style'),
          new RegExp('--opl-tiles-resized-height: ?' + height + 'px'),
          'Wrong resized height'
        );
      };

      // Image is in landscape and too large to fit in the landscape container in width
      containerWidth = 800;
      containerHeight = 600;
      expectedImageWidth = 900;
      expectedImageHeight = 500;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedWidth = enlargedWidth;
      resizedHeight = resizedWidth / (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);

      // Image is in landscape and too large to fit in the landscape container in both width and height
      containerWidth = 800;
      containerHeight = 600;
      expectedImageWidth = 1500;
      expectedImageHeight = 1400;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedHeight = enlargedHeight;
      resizedWidth = resizedHeight * (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - resizedWidth) / 2;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);

      // Image is in portait and too large to fit in the landscape container
      containerWidth = 800;
      containerHeight = 600;
      expectedImageWidth = 500;
      expectedImageHeight = 1000;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedHeight = enlargedHeight;
      resizedWidth = resizedHeight * (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - resizedWidth) / 2;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);

      // Image is in portait and too large to fit in the landscape container in both width and height
      containerWidth = 800;
      containerHeight = 600;
      expectedImageWidth = 2000;
      expectedImageHeight = 1000;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedWidth = enlargedWidth;
      resizedHeight = resizedWidth / (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - resizedWidth) / 2;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);

      // Image is in landscape and too large to fit in the portrait container in width
      containerWidth = 600;
      containerHeight = 800;
      expectedImageWidth = 1000;
      expectedImageHeight = 200;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedWidth = enlargedWidth;
      resizedHeight = resizedWidth / (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - resizedWidth) / 2;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);

      // Image is in landscape and too large to fit in the portrait container in both width and height
      containerWidth = 600;
      containerHeight = 800;
      expectedImageWidth = 5000;
      expectedImageHeight = 4000;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedWidth = enlargedWidth;
      resizedHeight = resizedWidth / (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - resizedWidth) / 2;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);

      // Image is in portrait and too large to fit in the portrait container in both width and height
      containerWidth = 600;
      containerHeight = 800;
      expectedImageWidth = 4000;
      expectedImageHeight = 5000;
      tilesElement.attr('style', 'width: ' + containerWidth + 'px; height:' + containerHeight + 'px;');
      angular.element(window).triggerHandler('resize');
      $timeout.flush(1000);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      isolateScope.handleTileImagePreload(
        scope.data[0],
        {
          width: expectedImageWidth,
          height: expectedImageHeight
        }
      );
      $timeout.flush(1000);

      enlargedWidth = containerWidth - 8 * 2;
      enlargedHeight = containerHeight - 8 * 2 - 40;

      resizedWidth = enlargedWidth;
      resizedHeight = resizedWidth / (expectedImageWidth / expectedImageHeight);
      resizedXPosition = expectedScrollValue + 8 + (enlargedWidth - resizedWidth) / 2;
      resizedYPosition = -(enlargedHeight - resizedHeight) / 2;

      validate(resizedXPosition, resizedYPosition, resizedWidth, resizedHeight);
    });

  });

  describe('reduceTile', function() {

    it('should reduce the enlarged tile', function() {
      scope.data = [
        {
          id: 1,
          type: 'text',
          time: 10000,
          title: 'Title 1'
        }
      ];
      element = angular.element('<opl-tiles ' +
                                  'id="opl-tiles-test"' +
                                  'opl-data="data"' +
                                  'opl-time="time"' +
                                '></opl-tiles>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush(1000);

      var ctrl = element.controller('oplTiles');
      var tileElements = angular.element(element[0].querySelectorAll('.opl-tiles-content > ul > li'));
      var enlargedTileElement = angular.element(tileElements[0]);

      ctrl.enlargeTile(scope.data[0].id);
      $timeout.flush(1000);

      assert.notOk(scope.data[0].abstract, 'Expected tile to be enlarged');

      assert.match(
        enlargedTileElement.attr('style'),
        /translateX\(var\(--opl-tiles-enlarged-xpos\)\)/,
        'Wrong tile x position'
      );
      assert.match(
        enlargedTileElement.attr('style'),
        /translateY\(var\(--opl-tiles-enlarged-ypos\)\)/,
        'Wrong tile y position'
      );

      ctrl.reduceTile();
      $timeout.flush(1000);

      assert.ok(scope.data[0].abstract, 'Expected tile to be reduced');

      assert.match(
        enlargedTileElement.attr('style'),
        /translateX\(8px\)/,
        'Wrong tile x position'
      );
      assert.match(
        enlargedTileElement.attr('style'),
        /translateY\(0\)/,
        'Wrong tile y position'
      );
    });

  });

});
