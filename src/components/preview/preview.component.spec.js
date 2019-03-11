'use strict';

window.assert = chai.assert;

describe('OplPreview', function() {
  var $compile;
  var $rootScope;
  var $httpBackend;
  var $filter;
  var scope;
  var element;

  // Load modules
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _$filter_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $filter = _$filter_;
  }));

  // Initializes tests
  beforeEach(function() {
    scope = $rootScope.$new();
  });

  it('should display an image and a time', function() {
    scope.time = 42000;
    scope.url = '/image.jpg';

    $httpBackend.whenGET(scope.url).respond(200);
    $httpBackend.expectGET(scope.url);

    element = angular.element('<opl-preview ' +
                                'opl-time="time" ' +
                                'opl-url="url"' +
                              '></opl-preview>');
    element = $compile(element)(scope);
    scope.$digest();
    $httpBackend.flush();

    var previewElement = angular.element(element[0].querySelector('.opl-preview'));
    var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
    var timeElement = angular.element(element[0].querySelector('.opl-time > div'));
    var errorElement = angular.element(element[0].querySelector('.opl-error-message'));

    assert.match(
      previewElement.attr('style'),
      new RegExp('background-image: ?url\\("' + scope.url + '"\\);'),
      'Wrong image'
    );
    assert.isUndefined(loaderElement[0], 'Unexpected loader');
    assert.isUndefined(errorElement[0], 'Unexpected error');
    assert.equal(timeElement.html(), $filter('oplMillisecondsToTime')(scope.time), 'Wrong time');
  });

  it('should display a loader while image is preloading', function() {
    scope.time = 42000;
    scope.url = '/image.jpg';

    $httpBackend.whenGET(scope.url).respond(200);
    $httpBackend.expectGET(scope.url);

    element = angular.element('<opl-preview ' +
                                'opl-time="time" ' +
                                'opl-url="url"' +
                              '></opl-preview>');
    element = $compile(element)(scope);
    scope.$digest();

    var previewElement = angular.element(element[0].querySelector('.opl-preview'));
    var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
    var timeElement = angular.element(element[0].querySelector('.opl-time > div'));
    var errorElement = angular.element(element[0].querySelector('.opl-error-message'));

    assert.match(
      previewElement.attr('style'),
      new RegExp('background-image: ?none;'),
      'Unexpected image'
    );
    assert.isDefined(loaderElement[0], 'Expected loader');
    assert.isUndefined(errorElement[0], 'Unexpected error');
    assert.equal(timeElement.html(), $filter('oplMillisecondsToTime')(scope.time), 'Wrong time');
  });

  it('should display an error message if preloading image failed', function() {
    scope.time = 42000;
    scope.url = '/image.jpg';

    $httpBackend.whenGET(scope.url).respond(404);
    $httpBackend.expectGET(scope.url);

    element = angular.element('<opl-preview ' +
                                'opl-time="time" ' +
                                'opl-url="url"' +
                              '></opl-preview>');
    element = $compile(element)(scope);
    scope.$digest();
    $httpBackend.flush();

    var previewElement = angular.element(element[0].querySelector('.opl-preview'));
    var loaderElement = angular.element(element[0].querySelector('.opl-loader'));
    var timeElement = angular.element(element[0].querySelector('.opl-time > div'));
    var errorElement = angular.element(element[0].querySelector('.opl-error-message'));

    assert.match(
      previewElement.attr('style'),
      new RegExp('background-image: ?none;'),
      'Unexpected image'
    );

    assert.isUndefined(loaderElement[0], 'Unexpected loader');
    assert.equal(
      angular.element(errorElement[0].querySelector('span')).html(),
      $filter('oplTranslate')('PREVIEW_IMAGE_PRELOAD_ERROR'),
      'Wrong error'
    );
    assert.equal(timeElement.html(), $filter('oplMillisecondsToTime')(scope.time), 'Wrong time');
  });

  it('should be able to change time dynamically', function() {
    scope.time = 42000;
    scope.url = '/image.jpg';

    $httpBackend.whenGET(scope.url).respond(200);
    $httpBackend.expectGET(scope.url);

    element = angular.element('<opl-preview ' +
                                'opl-time="time" ' +
                                'opl-url="url"' +
                              '></opl-preview>');
    element = $compile(element)(scope);
    scope.$digest();
    $httpBackend.flush();

    scope.time = 50000;
    scope.$digest();

    assert.equal(
      angular.element(element[0].querySelector('.opl-time > div')).html(),
      $filter('oplMillisecondsToTime')(scope.time),
      'Wrong time'
    );
  });

  it('should be able to change image dynamically', function() {
    scope.time = 42000;
    scope.url = '/image.jpg';

    $httpBackend.whenGET(scope.url).respond(200);
    $httpBackend.expectGET(scope.url);

    element = angular.element('<opl-preview ' +
                                'opl-time="time" ' +
                                'opl-url="url"' +
                              '></opl-preview>');
    element = $compile(element)(scope);
    scope.$digest();
    $httpBackend.flush();

    scope.url = '/image2.jpg';
    $httpBackend.whenGET(scope.url).respond(200);
    $httpBackend.expectGET(scope.url);
    scope.$digest();
    $httpBackend.flush();

    assert.match(
      angular.element(element[0].querySelector('.opl-preview')).attr('style'),
      new RegExp('background-image: ?url\\("' + scope.url + '"\\);'),
      'Wrong image'
    );
  });

});
