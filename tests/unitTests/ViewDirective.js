'use strict';

window.assert = chai.assert;

// ViewDirective.js
describe('ViewDirective', function() {
  var ovViewLink,
    $rootScope;

  // Load module player
  beforeEach(module('ov.player'));

  // Dependencies injections
  beforeEach(inject(function(_ovViewLink_, _$rootScope_) {
    $rootScope = _$rootScope_;
    ovViewLink = _ovViewLink_;
  }));

  it('Should add the view to the controller at initialization', function(done) {
    var viewScope = $rootScope.$new();
    viewScope.viewProperty = 'propertyValue';
    var viewController = {
      addView: function(viewScope) {
        assert.equal(viewScope.viewProperty, 'propertyValue');
        done();
      }
    };

    ovViewLink(viewScope, null, null, viewController);
  });

});
