'use strict';

window.assert = chai.assert;

// TabsDirective.js
describe('TabsDirective', function() {
  var $compile,
    $rootScope,
    element;

  // Load modules player and templates (to mock templates)
  beforeEach(function() {
    module('ov.player');
    module('templates');
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  // Initializes tests
  beforeEach(function() {
    var scope = $rootScope.$new();
    element = angular.element('<ov-tabs></ov-tabs>');
    element = $compile(element)(scope);
    scope.$digest();
  });

  it('Should be able to select a view', function() {
    var isolateScope = element.isolateScope();
    isolateScope.views = [
      {
        selected: false
      },
      {
        selected: true
      },
      {
        selected: false
      }
    ];

    isolateScope.select(isolateScope.views[2]);

    assert.equal(isolateScope.views[2].selected, true);
    assert.equal(isolateScope.views[1].selected, false);
    assert.equal(isolateScope.views[0].selected, false);
  });

  it('Should be able to add a view', function() {
    var ovTabsController = element.controller('ovTabs');
    var isolateScope = element.isolateScope();
    isolateScope.views = [];
    ovTabsController.addView({
      select: false
    });

    assert.equal(isolateScope.views.length, 1);
    assert.equal(isolateScope.views[0].selected, true);

    ovTabsController.addView({
      select: false
    });
    assert.equal(isolateScope.views.length, 2);

  });

});
