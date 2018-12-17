'use strict';

window.assert = chai.assert;

describe('OplTabsController', function() {
  var $componentController;
  var $rootScope;
  var ctrl;

  // Load module player
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_$componentController_, _$rootScope_) {
    $componentController = _$componentController_;
    $rootScope = _$rootScope_;
    ctrl = $componentController('oplTabs');
  }));

  describe('addView', function() {

    it('should register a view', function() {
      var expectedViewController = {};

      ctrl.addView(expectedViewController);
      $rootScope.$digest();

      assert.lengthOf(ctrl.views, 1, 'Expected view to be registered');
    });

    it('should select first registered view', function() {
      var expectedViewControllers = [{}, {}, {}, {}];

      expectedViewControllers.forEach(function(expectedViewController) {
        ctrl.addView(expectedViewController);
      });

      $rootScope.$digest();

      assert.ok(expectedViewControllers[0].selected, 'Expected first view to be selected');
    });

  });

  describe('removeView', function() {

    it('should unregister a view', function() {
      var expectedViewController = {};
      ctrl.addView(expectedViewController);
      $rootScope.$digest();

      assert.lengthOf(ctrl.views, 1, 'Expected view to be registered');

      ctrl.removeView(expectedViewController);
      $rootScope.$digest();

      assert.lengthOf(ctrl.views, 0, 'Expected view to be unregistered');
    });

    it('should no unregister view if not registered', function() {
      var expectedViewController = {};
      ctrl.addView(expectedViewController);
      $rootScope.$digest();

      ctrl.removeView({});
      $rootScope.$digest();

      assert.lengthOf(ctrl.views, 1, 'Expected view to still be registered');
    });

  });

  describe('select', function() {

    it('should select a view and unselect other views', function() {
      var expectedViewControllers = [{}, {}, {}];
      expectedViewControllers.forEach(function(expectedViewController) {
        ctrl.addView(expectedViewController);
      });
      $rootScope.$digest();

      ctrl.select(expectedViewControllers[expectedViewControllers.length - 1]);
      $rootScope.$digest();

      for (var i = 0; i < expectedViewControllers.length; i++) {
        if (i === expectedViewControllers.length - 1)
          assert.ok(expectedViewControllers[i].selected, 'Expected view "' + i + '" to be selected');
        else
          assert.notOk(expectedViewControllers[i].selected, 'Expected view "' + i + '" to be unselected');
      }
    });

    describe('selectViewById', function() {

      it('should select view corresponding to the given id', function() {
        var expectedViewControllers = [{
          oplViewId: '42'
        }, {
          oplViewId: '43'
        }];
        expectedViewControllers.forEach(function(expectedViewController) {
          ctrl.addView(expectedViewController);
        });
        $rootScope.$digest();

        ctrl.selectViewById(expectedViewControllers[1].oplViewId);
        $rootScope.$digest();

        assert.ok(expectedViewControllers[1].selected, 'Expected view to be selected');
      });

    });

  });

});
