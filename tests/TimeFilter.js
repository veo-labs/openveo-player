"use strict"

window.assert = chai.assert;

describe("TimeFilter", function(){
  
  beforeEach(module("ov.player"));
  
  var millisecondsToTimeFilter;

  beforeEach(inject(function(_$filter_){
    var $filter = _$filter_;
    millisecondsToTimeFilter = $filter("millisecondsToTime");
  }));

  it("Should return an empty String if no time is given", function(){
    var emptyTime = millisecondsToTimeFilter();
    assert.notOk(emptyTime);
    assert.isString(emptyTime);
  });
  
  it("Should be able to convert milliseconds to hh:mm:ss", function(){
    var time = millisecondsToTimeFilter(8804555);
    assert.equal(time, "02:26:44");
  });
  
  it("Should be able to convert milliseconds to mm:ss while no hours", function(){
    var time = millisecondsToTimeFilter(884555);
    assert.equal(time, "14:44");
  });
  
  it("Should be able to convert milliseconds to 00:ss while no hours and no minutes", function(){
    var time = millisecondsToTimeFilter(5500);
    assert.equal(time, "00:05");
  });  
  
});