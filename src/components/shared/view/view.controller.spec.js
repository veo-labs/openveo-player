'use strict';

window.assert = chai.assert;

describe('oplViewController', function() {
  var $componentController;
  var $rootScope;

  // Load module player
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_$componentController_, _$rootScope_) {
    $componentController = _$componentController_;
    $rootScope = _$rootScope_;
  }));

  it('should register view upon the OplTabsController', function(done) {
    var OplTabsController = {
      addView: function(controller) {
        assert.isDefined(controller, 'Expected view to be registered');
        done();
      },
      removeView: function() {}
    };
    $componentController('oplView', {
      $element: {
        controller: function() {
          return OplTabsController;
        }
      }
    });
  });

  it('should unregister view upon the OplTabsController', function(done) {
    var OplTabsController = {
      addView: function() {},
      removeView: function(controller) {
        assert.isDefined(controller, 'Expected view to be unregistered');
        done();
      }
    };
    $componentController('oplView', {
      $element: {
        controller: function() {
          return OplTabsController;
        }
      }
    });
    $rootScope.$destroy();
  });

});
