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
    ctrl = $componentController('oplTabs', {
      $element: {}
    });
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

});
