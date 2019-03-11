'use strict';

window.assert = chai.assert;

describe('OplTile', function() {
  var $compile;
  var $rootScope;
  var $timeout;
  var $document;
  var $filter;
  var $httpBackend;
  var scope;
  var element;
  var bodyElement;
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
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$document_, _$filter_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $document = _$document_;
    $filter = _$filter_;
    $httpBackend = _$httpBackend_;
  }));

  // Mock component style
  beforeEach(function() {
    var style = 'body {width: 1000px; height: 1000px;}' +
      'opl-tile,.opl-tile {position: relative;width: 100%; height: 100%;}';

    var styleElement = $document[0].createElement('style');
    styleElement.setAttribute('id', 'opl-tile-test-style');
    styleElement.appendChild($document[0].createTextNode(style));
    $document[0].head.appendChild(styleElement);
  });

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
    bodyElement = angular.element($document[0].body);
  });

  afterEach(function() {
    var componentElement = $document[0].body.querySelector('#opl-tile-test');
    $document[0].head.removeChild($document[0].head.querySelector('#opl-tile-test-style'));
    if (componentElement) $document[0].body.removeChild(componentElement);
  });

  describe('abstract', function() {

    beforeEach(function() {
      scope.abstract = true;
    });

    it('should be able to display a text tile as abstract', function() {
      scope.data = {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>'
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
      var contentElement = angular.element(element[0].querySelector('.opl-content'));
      var errorElement = angular.element(element[0].querySelector('.opl-error-message'));
      var titleElement = angular.element(element[0].querySelector('.opl-title > p'));
      var timeElement = angular.element(element[0].querySelector('.opl-access-time'));
      var moreButtonElement = angular.element(element[0].querySelector('.opl-more-button opl-button'));
      var fullElement = angular.element(element[0].querySelector('.opl-full'));

      assert.equal(tileElement.attr('tabindex'), '-1', 'Wrong tabindex');
      assert.ok(tileElement.hasClass('opl-tile-abstract'), 'Expected class "opl-tile-abstract"');
      assert.isUndefined(loaderElement[0], 'Unexpected loader');
      assert.isUndefined(errorElement[0], 'Unexpected error');
      assert.isUndefined(fullElement[0], 'Unexpected full');
      assert.match(contentElement.attr('style'), /background-image: ?none;/, 'Unexpected small image');
      assert.equal(titleElement.text(), scope.data.title, 'Wrong title');
      assert.equal(timeElement.text(), $filter('oplMillisecondsToTime')(scope.data.time), 'Wrong time');
      assert.equal(moreButtonElement.attr('opl-icon'), 'more_horiz', 'Wrong "more info" icon');
      assert.equal(
        moreButtonElement.attr('opl-no-sequential-focus'),
        'true',
        'Unexpected "more info" button sequential focus'
      );
      assert.equal(
        moreButtonElement.attr('opl-label'),
        $filter('oplTranslate')('TILE_MORE_INFO_BUTTON_LABEL'),
        'Wrong more label'
      );
    });

    it('should be able to display an image tile as abstract', function() {
      scope.data = {
        id: 1,
        type: 'image',
        time: 40000,
        image: {
          small: 'image-small.jpg',
          large: 'image-large.jpg'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var titleElement = angular.element(element[0].querySelector('.opl-title > p'));
      var contentElement = angular.element(element[0].querySelector('.opl-content'));
      var errorElement = angular.element(element[0].querySelector('.opl-error-message'));
      var timeElement = angular.element(element[0].querySelector('.opl-access-time'));
      var moreButtonElement = angular.element(element[0].querySelector('.opl-more-button opl-button'));
      var fullElement = angular.element(element[0].querySelector('.opl-full'));

      assert.isUndefined(titleElement[0], 'Unexpected title');
      assert.isUndefined(errorElement[0], 'Unexpected error');
      assert.isUndefined(fullElement[0], 'Unexpected full');
      assert.ok(tileElement.hasClass('opl-type-image'), 'Expected class "opl-type-image"');
      assert.match(contentElement.attr('style'), /background-image: ?none;/, 'Unexpected small image');
      assert.equal(timeElement.text(), $filter('oplMillisecondsToTime')(scope.data.time), 'Wrong time');
      assert.equal(moreButtonElement.attr('opl-icon'), 'more_horiz', 'Wrong "more info" icon');
      assert.equal(
        moreButtonElement.attr('opl-no-sequential-focus'),
        'true',
        'Unexpected "more info" button sequential focus'
      );
      assert.equal(
        moreButtonElement.attr('opl-label'),
        $filter('oplTranslate')('TILE_MORE_INFO_BUTTON_LABEL'),
        'Wrong more label'
      );
    });

    it('should display the loader if small image is preloading', function() {
      scope.data = {
        id: 1,
        type: 'image',
        time: 40000,
        image: {
          small: 'image-small.jpg',
          large: 'image-large.jpg'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var ctrl = element.controller('oplTile');

      $httpBackend.whenGET(scope.data.image.small).respond(200);
      $httpBackend.expectGET(scope.data.image.small);

      ctrl.preload();
      $timeout.flush();

      var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
      assert.isDefined(loaderElement[0], 'Expected loader');

      $httpBackend.flush();
    });

    it('should switch focus between tile and "more info" button when using arrow keys', function() {
      scope.data = {
        id: 1,
        type: 'image',
        time: 40000,
        image: {
          small: 'image-small.jpg',
          large: 'image-large.jpg'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var ctrl = element.controller('oplTile');
      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var moreInfoButtonElement = angular.element(element[0].querySelector('.opl-abstract opl-button'));

      tileElement.triggerHandler({type: 'keydown', keyCode: 38});

      assert.ok(moreInfoButtonElement.controller('oplButton').isFocused(), 'Expected more info button to be focused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');

      tileElement.triggerHandler({type: 'keydown', keyCode: 40});

      assert.ok(ctrl.isFocused(), 'Expected tile to be focused');
      assert.notOk(
        moreInfoButtonElement.controller('oplButton').isFocused(),
        'Expected "more info" button to be unfocused'
      );
    });

    it('should action tile when using enter keys', function() {
      scope.data = {
        id: 1,
        type: 'image',
        time: 40000,
        image: {
          small: 'image-small.jpg',
          large: 'image-large.jpg'
        }
      };
      scope.handleOnSelect = chai.spy(function(tile) {
        assert.strictEqual(tile, scope.data, 'Wrong tile');
      });

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                  'opl-on-select="handleOnSelect(tile)"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var tileElement = angular.element(element[0].querySelector('.opl-tile'));

      tileElement.triggerHandler({type: 'keydown', keyCode: 13});

      scope.handleOnSelect.should.have.been.called.exactly(1);
    });

    it('should set class "opl-over" when pointer enters the title or time elements', function() {
      scope.data = {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>'
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');

      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var titleElement = angular.element(element[0].querySelector('.opl-title'));
      var timeIconElement = angular.element(element[0].querySelector('.opl-access-time-icon'));
      var timeElement = angular.element(element[0].querySelector('.opl-access-time'));

      titleElement.triggerHandler('mouseover');
      assert.ok(tileElement.hasClass('opl-over'), 'Expected class "opl-over"');
      titleElement.triggerHandler('mouseout');
      assert.notOk(tileElement.hasClass('opl-over'), 'Unexpected class "opl-over"');

      timeIconElement.triggerHandler('mouseover');
      assert.ok(tileElement.hasClass('opl-over'), 'Expected class "opl-over"');
      timeIconElement.triggerHandler('mouseout');
      assert.notOk(tileElement.hasClass('opl-over'), 'Unexpected class "opl-over"');

      timeElement.triggerHandler('mouseover');
      assert.ok(tileElement.hasClass('opl-over'), 'Expected class "opl-over"');
      timeElement.triggerHandler('mouseout');
      assert.notOk(tileElement.hasClass('opl-over'), 'Unexpected class "opl-over"');
    });

  });

  describe('full', function() {

    beforeEach(function() {
      scope.abstract = false;
    });

    it('should be able to display a text tile as full', function() {
      scope.data = {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>',
        file: {
          url: '/file.jpg',
          originalName: 'download-file-name'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var abstractElement = angular.element(element[0].querySelector('.opl-abstract'));
      var imageElement = angular.element(element[0].querySelector('.opl-full > img'));
      var errorElement = angular.element(element[0].querySelector('.opl-error-message'));
      var titleElement = angular.element(element[0].querySelector('.opl-title > p'));
      var closeButtonElement = angular.element(element[0].querySelector('.opl-close-button opl-button'));
      var contentElement = angular.element(element[0].querySelector('.opl-content'));
      var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
      var descriptionElement = angular.element(element[0].querySelector('.opl-description'));
      var descriptionScrollerElement = angular.element(element[0].querySelector('.opl-description > opl-scroller'));
      var descriptionContentElement = angular.element(
        element[0].querySelector('.opl-description .opl-tile-description')
      );
      var attachmentElement = angular.element(element[0].querySelector('.opl-attachment'));
      var tileElementBoundingRectangle = tileElement[0].getBoundingClientRect();
      var titleElementBoundingRectangle = titleElement[0].getBoundingClientRect();
      var attachmentElementBoundingRectangle = attachmentElement[0].getBoundingClientRect();
      var descriptionHeight = tileElementBoundingRectangle.height - titleElementBoundingRectangle.height -
          attachmentElementBoundingRectangle.height - 8 * 2;

      assert.isUndefined(loaderElement[0], 'Unexpected loader');
      assert.isUndefined(abstractElement[0], 'Unexpected abstract');
      assert.isUndefined(imageElement[0], 'Unexpected image');
      assert.isUndefined(errorElement[0], 'Unexpected error');
      assert.match(contentElement.attr('style'), /background-image: ?none;/, 'Unexpected small image');
      assert.match(
        descriptionElement.attr('style'),
        new RegExp('height: ' + descriptionHeight + '?px'),
        'Wrong description height'
      );
      assert.equal(titleElement.text(), scope.data.title, 'Wrong title');
      assert.equal(closeButtonElement.attr('opl-icon'), 'close', 'Wrong close icon');
      assert.equal(
        closeButtonElement.attr('opl-no-sequential-focus'),
        'true',
        'Unexpected close button sequential focus'
      );
      assert.equal(
        closeButtonElement.attr('opl-label'),
        $filter('oplTranslate')('TILE_CLOSE_BUTTON_LABEL'),
        'Wrong close label'
      );
      assert.equal(
        descriptionScrollerElement.attr('opl-id'),
        'opl-tile-' + scope.data.id + '-description',
        'Wrong scroller id'
      );
      assert.equal(descriptionScrollerElement.attr('opl-orientation'), 'vertical', 'Wrong scroller orientation');
      assert.equal(
        descriptionScrollerElement.attr('opl-no-sequential-focus'),
        'true',
        'Unexpected scroller sequential focus'
      );
      assert.equal(descriptionContentElement.html(), scope.data.description, 'Wrong description content');
      assert.equal(attachmentElement.find('a').attr('download'), scope.data.file.originalName, 'Wrong attachment name');
      assert.equal(attachmentElement.find('i').html(), 'attachment', 'Wrong attachment icon');
      assert.equal(
        attachmentElement.find('a').attr('href'),
        scope.data.file.url + '?filename=' + scope.data.file.originalName,
        'Wrong attachment URL'
      );
      assert.equal(
        attachmentElement.find('span').html(),
        scope.data.file.url.replace('/', ''),
        'Wrong attachment file name'
      );
    });

    it('should be able to display an image tile as full', function(done) {
      scope.data = {
        id: 1,
        type: 'image',
        time: 20000,
        image: {
          small: 'image-small.jpg',
          large: base64Image
        }
      };
      scope.handleOnImagePreloaded = function(tile, size) {
        scope.$digest();

        var tileElement = angular.element(element[0].querySelector('.opl-tile'));
        var abstractElement = angular.element(element[0].querySelector('.opl-abstract'));
        var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
        var errorElement = angular.element(element[0].querySelector('.opl-error-message'));
        var imageElement = angular.element(element[0].querySelector('.opl-full > img'));
        var closeButtonElement = angular.element(element[0].querySelector('.opl-close-button opl-button'));

        assert.strictEqual(tile, scope.data, 'Wrong tile');
        assert.equal(size.width, 1, 'Wrong image width');
        assert.equal(size.height, 1, 'Wrong image height');
        assert.isUndefined(abstractElement[0], 'Unexpected abstract');
        assert.isUndefined(loaderElement[0], 'Unexpected loader');
        assert.isUndefined(errorElement[0], 'Unexpected error');
        assert.ok(tileElement.hasClass('opl-type-image'), 'Expected class "opl-type-image"');
        assert.equal(imageElement.attr('src'), scope.data.image.large, 'Wrong image');
        assert.equal(closeButtonElement.attr('opl-icon'), 'close', 'Wrong close icon');
        assert.equal(
          closeButtonElement.attr('opl-no-sequential-focus'),
          'true',
          'Unexpected close button sequential focus'
        );
        assert.equal(
          closeButtonElement.attr('opl-label'),
          $filter('oplTranslate')('TILE_CLOSE_BUTTON_LABEL'),
          'Wrong close label'
        );
        done();
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                  'opl-on-image-preloaded="handleOnImagePreloaded(tile, size)"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();
    });

    it('should display the loader if large image is preloading', function(done) {
      scope.data = {
        id: 1,
        type: 'image',
        time: 20000,
        image: {
          small: 'image-small.jpg',
          large: base64Image
        }
      };
      scope.handleOnImagePreloaded = function(tile, size) {
        var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
        assert.isDefined(loaderElement[0], 'Expected loader');

        scope.$digest();
        done();
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                  'opl-on-image-preloaded="handleOnImagePreloaded(tile, size)"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();
    });

    it('should display an error message if preloading large image failed', function(done) {
      scope.data = {
        id: 1,
        type: 'image',
        time: 20000,
        image: {
          small: 'image-small.jpg',
          large: 'wrong-image-url'
        }
      };
      scope.handleOnImagePreloaded = function(tile, size) {
        assert.ok(false, 'Unexpected image');
      };

      scope.handleOnImageError = function(tile) {
        scope.$digest();

        var errorElement = angular.element(element[0].querySelector('.opl-error-message > span'));
        var imageElement = angular.element(element[0].querySelector('.opl-full > img'));

        assert.strictEqual(tile, scope.data, 'Wrong tile');
        assert.equal(errorElement.text(), $filter('oplTranslate')('TILE_IMAGE_PRELOAD_ERROR'), 'Wrong error');
        assert.isUndefined(imageElement[0], 'Unexpected image');

        done();
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                  'opl-on-image-preloaded="handleOnImagePreloaded(tile, size)"' +
                                  'opl-on-image-error="handleOnImageError(tile)"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();
    });

    it('should navigate between close button, description and attachment button', function() {
      scope.data = {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>',
        file: {
          url: '/file.jpg',
          originalName: 'download-file-name'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var ctrl = element.controller('oplTile');
      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var closeButtonElement = angular.element(element[0].querySelector('.opl-close-button opl-button'));
      var descriptionScrollerElement = angular.element(element[0].querySelector('.opl-description > opl-scroller'));
      var attachmentButtonElement = angular.element(element[0].querySelector('.opl-attachment a'));

      ctrl.focus();
      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');

      // Next
      tileElement.triggerHandler({type: 'keydown', keyCode: 39});

      assert.ok(descriptionScrollerElement.controller('oplScroller').isFocused(), 'Expected description to be focused');
      assert.notOk(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be unfocused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');
      assert.notEqual(
        $document[0].activeElement,
        attachmentButtonElement[0],
        'Expected attachment button to be unfocused'
      );

      // Next
      tileElement.triggerHandler({type: 'keydown', keyCode: 40});

      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');
      assert.notOk(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be unfocused');
      assert.strictEqual(
        $document[0].activeElement,
        attachmentButtonElement[0],
        'Expected attachment button to be focused'
      );
      assert.notOk(
        descriptionScrollerElement.controller('oplScroller').isFocused(),
        'Expected description to be unfocused'
      );

      // Previous x 2
      tileElement.triggerHandler({type: 'keydown', keyCode: 37});
      tileElement.triggerHandler({type: 'keydown', keyCode: 38});

      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');
      assert.notEqual(
        $document[0].activeElement,
        attachmentButtonElement[0],
        'Expected attachment button to be unfocused'
      );
      assert.notOk(
        descriptionScrollerElement.controller('oplScroller').isFocused(),
        'Expected description to be unfocused'
      );

      // Previous
      tileElement.triggerHandler({type: 'keydown', keyCode: 38});

      assert.notOk(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be unfocused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');
      assert.strictEqual(
        $document[0].activeElement,
        attachmentButtonElement[0],
        'Expected attachment button to be focused'
      );
      assert.notOk(
        descriptionScrollerElement.controller('oplScroller').isFocused(),
        'Expected description to be unfocused'
      );

    });

    it('should navigate between close button and description if no attachment button', function() {
      scope.data = {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>'
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var ctrl = element.controller('oplTile');
      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var closeButtonElement = angular.element(element[0].querySelector('.opl-close-button opl-button'));
      var descriptionScrollerElement = angular.element(element[0].querySelector('.opl-description > opl-scroller'));

      ctrl.focus();
      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');

      // Next
      tileElement.triggerHandler({type: 'keydown', keyCode: 39});

      assert.ok(
        descriptionScrollerElement.controller('oplScroller').isFocused(),
        'Expected description to be focused'
      );
      assert.notOk(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be unfocused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');

      // Next
      tileElement.triggerHandler({type: 'keydown', keyCode: 40});

      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');
      assert.notOk(
        descriptionScrollerElement.controller('oplScroller').isFocused(),
        'Expected description to be unfocused'
      );

      // Previous x 2
      tileElement.triggerHandler({type: 'keydown', keyCode: 38});
      tileElement.triggerHandler({type: 'keydown', keyCode: 37});

      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');
      assert.notOk(ctrl.isFocused(), 'Expected tile to be unfocused');
      assert.notOk(
        descriptionScrollerElement.controller('oplScroller').isFocused(),
        'Expected description to be unfocused'
      );

    });

    it('should not be able to navigate if no description nor attachment button', function() {
      scope.data = {
        id: 1,
        type: 'image',
        time: 20000,
        image: {
          small: 'image-small.jpg',
          large: 'wrong-image-url'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var ctrl = element.controller('oplTile');
      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var closeButtonElement = angular.element(element[0].querySelector('.opl-close-button opl-button'));

      ctrl.focus();
      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');

      // Next
      tileElement.triggerHandler({type: 'keydown', keyCode: 39});

      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');
    });

    it('should call function defined in "opl-on-close" attribute when actioned using enter key on close button or ' +
       'escape key', function() {
      scope.handleOnclose = chai.spy(function() {});
      scope.data = {
        id: 1,
        type: 'image',
        time: 20000,
        image: {
          small: 'image-small.jpg',
          large: 'wrong-image-url'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                  'opl-on-close="handleOnclose()"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var ctrl = element.controller('oplTile');
      var tileElement = angular.element(element[0].querySelector('.opl-tile'));
      var closeButtonElement = angular.element(element[0].querySelector('.opl-close-button opl-button'));

      ctrl.focus();
      assert.ok(closeButtonElement.controller('oplButton').isFocused(), 'Expected close button to be focused');

      tileElement.triggerHandler({type: 'keydown', keyCode: 13});
      tileElement.triggerHandler({type: 'keydown', keyCode: 27});

      scope.handleOnclose.should.have.been.called.exactly(2);
    });

    it('should set class "opl-focus" on attachment button when focused', function() {
      scope.data = {
        id: 1,
        type: 'text',
        title: 'Title',
        time: 20000,
        description: '<h1>Description</h1>',
        file: {
          url: '/file.jpg',
          originalName: 'download-file-name'
        }
      };

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();

      var attachmentButtonElement = angular.element(element[0].querySelector('.opl-attachment a'));

      attachmentButtonElement[0].focus();
      scope.$digest();

      assert.ok(attachmentButtonElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

      element.controller('oplTile').focus();

      assert.notOk(attachmentButtonElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
    });

  });

  it('should set class "opl-focus" when focused', function() {
    scope.data = {
      id: 1,
      type: 'text',
      title: 'Title',
      time: 20000,
      description: '<h1>Description</h1>'
    };
    scope.abstract = true;

    element = angular.element('<opl-tile ' +
                                'id="opl-tile-test"' +
                                'opl-data="data" ' +
                                'opl-abstract="abstract"' +
                              '></opl-tile>');

    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var tileElement = angular.element(element[0].querySelector('.opl-tile'));

    tileElement.triggerHandler('focus');

    assert.ok(tileElement.hasClass('opl-focus'), 'Expected class "opl-focus"');

    tileElement.triggerHandler('blur');

    assert.notOk(tileElement.hasClass('opl-focus'), 'Unexpected class "opl-focus"');
  });

  it('should call function defined in "opl-on-select" attribute when actioned', function() {
    scope.data = {
      id: 1,
      type: 'text',
      title: 'Title',
      time: 20000,
      description: '<h1>Description</h1>'
    };
    scope.abstract = true;
    scope.handleOnSelect = chai.spy(function(tile) {
      assert.strictEqual(tile, scope.data, 'Wrong tile');
    });

    element = angular.element('<opl-tile ' +
                                'id="opl-tile-test"' +
                                'opl-data="data" ' +
                                'opl-abstract="abstract"' +
                                'opl-on-select="handleOnSelect(tile)"' +
                              '></opl-tile>');

    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var tileElement = angular.element(element[0].querySelector('.opl-tile'));

    tileElement.triggerHandler('mousedown');
    bodyElement.triggerHandler('mouseup');

    scope.handleOnSelect.should.have.been.called.exactly(1);
  });

  it('should be able to switch between abstract and full dynamically', function() {
    scope.data = {
      id: 1,
      type: 'text',
      title: 'Title',
      time: 20000,
      description: '<h1>Description</h1>'
    };
    scope.abstract = true;

    element = angular.element('<opl-tile ' +
                                'id="opl-tile-test"' +
                                'opl-data="data" ' +
                                'opl-abstract="abstract"' +
                              '><opl-tile>');

    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    var fullElement = angular.element(element[0].querySelector('.opl-full'));
    var abstractElement = angular.element(element[0].querySelector('.opl-abstract'));

    assert.isUndefined(fullElement[0], 'Unexpected full');
    assert.isDefined(abstractElement[0], 'Expected abstract');

    scope.abstract = false;
    scope.$digest();
    $timeout.flush();

    fullElement = angular.element(element[0].querySelector('.opl-full'));
    abstractElement = angular.element(element[0].querySelector('.opl-abstract'));

    assert.isDefined(fullElement[0], 'Expected full');
    assert.isUndefined(abstractElement[0], 'Unexpected abstract');
  });

  it('should be able to change tile data dynamically', function() {
    scope.data = {
      id: 1,
      type: 'text',
      title: 'Title',
      time: 20000,
      description: '<h1>Description</h1>'
    };
    scope.abstract = true;

    element = angular.element('<opl-tile ' +
                                'id="opl-tile-test"' +
                                'opl-data="data" ' +
                                'opl-abstract="abstract"' +
                              '></opl-tile>');

    $document[0].body.appendChild(element[0]);
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();

    scope.data = {
      id: 2,
      type: 'text',
      title: 'New title',
      time: 40000,
      description: '<h1>Description 2</h1>'
    };
    scope.$digest();
    $timeout.flush();

    var tileElement = angular.element(element[0].querySelector('.opl-tile'));
    var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
    var contentElement = angular.element(element[0].querySelector('.opl-content'));
    var errorElement = angular.element(element[0].querySelector('.opl-error-message'));
    var titleElement = angular.element(element[0].querySelector('.opl-title > p'));
    var timeElement = angular.element(element[0].querySelector('.opl-access-time'));
    var moreButtonElement = angular.element(element[0].querySelector('.opl-more-button opl-button'));
    var fullElement = angular.element(element[0].querySelector('.opl-full'));

    assert.equal(tileElement.attr('tabindex'), '-1', 'Wrong tabindex');
    assert.ok(tileElement.hasClass('opl-tile-abstract'), 'Expected class "opl-tile-abstract"');
    assert.isUndefined(loaderElement[0], 'Unexpected loader');
    assert.isUndefined(errorElement[0], 'Unexpected error');
    assert.isUndefined(fullElement[0], 'Unexpected full');
    assert.match(contentElement.attr('style'), /background-image: ?none;/, 'Unexpected small image');
    assert.equal(titleElement.text(), scope.data.title, 'Wrong title');
    assert.equal(timeElement.text(), $filter('oplMillisecondsToTime')(scope.data.time), 'Wrong time');
    assert.equal(moreButtonElement.attr('opl-icon'), 'more_horiz', 'Wrong more icon');
    assert.equal(
      moreButtonElement.attr('opl-no-sequential-focus'),
      'true',
      'Unexpected "more info" button sequential focus'
    );
    assert.equal(
      moreButtonElement.attr('opl-label'),
      $filter('oplTranslate')('TILE_MORE_INFO_BUTTON_LABEL'),
      'Wrong more label'
    );
  });

  describe('preload', function() {

    beforeEach(function() {
      scope.data = {
        id: 1,
        type: 'image',
        time: 40000,
        image: {
          small: 'image-small.jpg',
          large: 'image-large.jpg'
        }
      };
      scope.abstract = true;

      element = angular.element('<opl-tile ' +
                                  'id="opl-tile-test"' +
                                  'opl-data="data" ' +
                                  'opl-abstract="abstract"' +
                                '></opl-tile>');
      $document[0].body.appendChild(element[0]);
      element = $compile(element)(scope);
      scope.$digest();
      $timeout.flush();
    });

    it('should preload the small image', function() {
      var contentElement = angular.element(element[0].querySelector('.opl-content'));
      var errorElement = angular.element(element[0].querySelector('.opl-error-message'));
      var ctrl = element.controller('oplTile');

      $httpBackend.whenGET(scope.data.image.small).respond(200);
      $httpBackend.expectGET(scope.data.image.small);

      ctrl.preload();
      $httpBackend.flush();

      assert.match(
        contentElement.attr('style'),
        new RegExp('background-image: ?url\\("' + scope.data.image.small + '"\\);'),
        'Wrong image'
      );
      assert.isUndefined(errorElement[0], 'Unexpected error');
    });

    it('should display an error message if preloading the small image failed', function() {
      var ctrl = element.controller('oplTile');

      $httpBackend.whenGET(scope.data.image.small).respond(500);
      $httpBackend.expectGET(scope.data.image.small);

      ctrl.preload();
      $httpBackend.flush();

      var contentElement = angular.element(element[0].querySelector('.opl-content'));
      var errorElement = angular.element(element[0].querySelector('.opl-error-message > span'));

      assert.match(contentElement.attr('style'), /background-image: ?none;/, 'Unexpected small image');
      assert.equal(errorElement.text(), $filter('oplTranslate')('TILE_IMAGE_PRELOAD_ERROR'), 'Wrong error');
    });

    it('should display the loader when preloading the small image', function() {
      var ctrl = element.controller('oplTile');

      $httpBackend.whenGET(scope.data.image.small).respond(200);

      ctrl.preload();
      scope.$digest();

      var loaderElement = angular.element(element[0].querySelector('.opl-loader'));

      assert.isDefined(loaderElement[0], 'Expected loader');
    });

  });

});
