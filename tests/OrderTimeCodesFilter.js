"use strict"

window.assert = chai.assert;

// OrderTimeCodesFilter.js
describe("OrderTimeCodesFilter", function(){
  var orderTimeCodesFilter;
  
  // Load module player
  beforeEach(module("ov.player"));

  // Dependencies injections
  beforeEach(inject(function(_$filter_){
    var $filter = _$filter_;
    orderTimeCodesFilter = $filter("orderTimeCodes");
  }));

  it("Should return an empty array if no timecodes", function(){
    assert.isArray(orderTimeCodesFilter());
  });
  
  it("Should be able to order a list of timecodes by timecodes", function(){
    var timecodes = {
      20 : { id : 20},
      5 : { id : 5},
      0 : { id : 0},
      200 : { id : 200},
      6 : { id : 6}
    };
    
    timecodes = orderTimeCodesFilter(timecodes);
    assert.equal(timecodes[0].id, 0);
    assert.equal(timecodes[1].id, 5);
    assert.equal(timecodes[2].id, 6);
    assert.equal(timecodes[3].id, 20);
    assert.equal(timecodes[4].id, 200);
  });  
  
});