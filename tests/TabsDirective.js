"use strict"

window.assert = chai.assert;

describe("TabsDirective", function(){
  
  beforeEach(module("ov.player"));
  beforeEach(module("templates"));

  var $compile, $rootScope, element;
  
  beforeEach(inject(function(_$compile_, _$rootScope_){
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    var scope = $rootScope.$new(); 
    element = angular.element("<ov-tabs></ov-tabs>");
    element = $compile(element)(scope);
    scope.$digest();    
  }));

  it("Should be able to select a view", function(){
    var isolateScope = element.isolateScope();
    isolateScope.views = [
      {selected : false},
      {selected : true},
      {selected : false}
    ];
    
    isolateScope.select(isolateScope.views[2]);
    
    assert.equal(isolateScope.views[2].selected, true);
    assert.equal(isolateScope.views[1].selected, false);
    assert.equal(isolateScope.views[0].selected, false);
  });

  it("Should be able to add a view", function(){
    var ovTabsController = element.controller("ovTabs");
    var isolateScope = element.isolateScope();
    isolateScope.views = [];
    ovTabsController.addView({select : false});
    
    assert.equal(isolateScope.views.length, 1);
    assert.equal(isolateScope.views[0].selected, true);
    
    ovTabsController.addView({select : false});
    assert.equal(isolateScope.views.length, 2);
    
  });
  
});