'use strict';

window.assert = chai.assert;

describe('OplIndexesController', function() {
  var $componentController;

  // Load modules
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_$componentController_) {
    $componentController = _$componentController_;
  }));

  describe('$onInit', function() {

    it('should set active index to the first one at initialization time', function() {
      var expectedIndexes = [
        {
          timecode: 42,
          image: {
            small: 'small1.jpg',
            large: 'large1.jpg'
          }
        }
      ];
      var ctrl = $componentController('oplIndexes', null, {
        oplIndexes: expectedIndexes
      });
      ctrl.$onInit();

      assert.strictEqual(ctrl.activeIndex, expectedIndexes[0], 'Wrong index');
    });

  });

  describe('setActiveIndex', function() {

    it('should change the active index', function() {
      var expectedIndexes = [
        {
          timecode: 42,
          image: {
            small: 'small1.jpg',
            large: 'large1.jpg'
          }
        },
        {
          timecode: 43,
          image: {
            small: 'small2.jpg',
            large: 'large2.jpg'
          }
        }
      ];
      var ctrl = $componentController('oplIndexes', null, {
        oplIndexes: expectedIndexes
      });
      ctrl.$onInit();

      ctrl.setActiveIndex(expectedIndexes[1]);
      assert.strictEqual(ctrl.activeIndex, expectedIndexes[1], 'Wrong index');
    });

  });

  describe('goToIndex', function() {

    it('should execute oplOnSeek function with the given index', function(done) {
      var expectedIndexes = [
        {
          timecode: 42,
          image: {
            small: 'small1.jpg',
            large: 'large1.jpg'
          }
        }
      ];
      var expectedFunction = function() {
        done();
      };
      var ctrl = $componentController('oplIndexes', null, {
        oplIndexes: expectedIndexes,
        oplOnSeek: expectedFunction
      });
      ctrl.$onInit();
      ctrl.goToIndex(expectedIndexes[0]);
    });

  });

});
