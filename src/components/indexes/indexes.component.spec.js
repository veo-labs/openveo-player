'use strict';

window.assert = chai.assert;

describe('oplIndexes', function() {
  var $compile;
  var $rootScope;
  var scope;
  var element;
  var ctrl;

  // Load modules
  beforeEach(function() {
    module('ov.player', function($controllerProvider, $filterProvider) {

      // Mock controller
      $controllerProvider.register('OplIndexesController', function() {});

      // Mock oplMillisecondsToTime filter
      $filterProvider.register('oplMillisecondsToTime', function() {
        return function(time) {
          return time;
        };
      });

    });
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
    element = angular.element('<opl-indexes></opl-indexes>');
    element = $compile(element)(scope);
    scope.$digest();
    ctrl = element.controller('oplIndexes');
  });

  it('should display a list of indexes', function() {
    var expectedIndexes = [
      {
        timecode: 42,
        image: {
          small: 'small1.jpg',
          large: 'large1.jpg'
        }
      }
    ];
    ctrl.oplIndexes = expectedIndexes;
    $rootScope.$digest();

    var liElements = element[0].querySelectorAll('li');
    assert.lengthOf(liElements, expectedIndexes.length);

    for (var i = 0; i < liElements.length; i++) {
      assert.equal(
        angular.element(liElements[i].querySelector('img')).attr('src'),
        expectedIndexes[i].image.small,
        'Wrong image for li ' + i
      );
      assert.equal(
        angular.element(liElements[i].querySelector('p')).text(),
        expectedIndexes[i].timecode,
        'Wrong time for li ' + i
      );
    }
  });

  it('should display the active index large image', function() {
    ctrl.activeIndex = {
      timecode: 42,
      image: {
        small: 'small1.jpg',
        large: 'large1.jpg'
      }
    };
    $rootScope.$digest();

    var activeIndexImage = element[0].querySelector('.opl-focused-index > div');
    assert.include(
      angular.element(activeIndexImage).attr('style'),
      'background-image: url("' + ctrl.activeIndex.image.large + '")',
      'Wrong active image'
    );
  });

  it('should ask controller to change active index on mouse over', function(done) {
    ctrl.oplIndexes = [
      {
        timecode: 42,
        image: {
          small: 'small1.jpg',
          large: 'large1.jpg'
        }
      }
    ];
    $rootScope.$digest();

    ctrl.setActiveIndex = function(index) {
      assert.strictEqual(index, ctrl.oplIndexes[0], 'Wrong index');
      done();
    };

    angular.element(element[0].querySelector('li')).triggerHandler({type: 'mouseenter'});
    $rootScope.$digest();
  });

  it('should ask controller to go to index on click', function(done) {
    ctrl.oplIndexes = [
      {
        timecode: 42,
        image: {
          small: 'small1.jpg',
          large: 'large1.jpg'
        }
      }
    ];
    $rootScope.$digest();

    ctrl.goToIndex = function(index) {
      assert.strictEqual(index, ctrl.oplIndexes[0], 'Wrong index');
      done();
    };

    angular.element(element[0].querySelector('li')).triggerHandler({type: 'click'});
    $rootScope.$digest();
  });

});
