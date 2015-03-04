"use strict"

window.assert = chai.assert;

describe("ViewDirective", function(){
  
  beforeEach(module("ov.player"));

  var ovViewLink, $rootScope;
  
  beforeEach(inject(function(_ovViewLink_, _$rootScope_){
    $rootScope = _$rootScope_;
    ovViewLink = _ovViewLink_;
  }));

  it("Should add the view to the controller at initialization", function(done){ 
    
    var viewScope = $rootScope.$new();
    viewScope.viewProperty = "propertyValue";
    var viewController = {
      addView : function(viewScope){
        assert.equal(viewScope.viewProperty, "propertyValue");
        done();
      }
    };
    
    ovViewLink(viewScope, null, null, viewController);
  }); 
  
});