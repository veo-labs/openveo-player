"use strict"

window.assert = chai.assert;

// IndexDirective.js
describe("IndexDirective", function(){
  var ovIndexLink, $rootScope, playerScope, indexScope;
  // Load module player
  beforeEach(module("ov.player"));

  // Dependencies injections
  beforeEach(inject(function(_ovIndexLink_, _$rootScope_){
    $rootScope = _$rootScope_;
    ovIndexLink = _ovIndexLink_;
  }));

  // Initializes tests
  beforeEach(function(){
    playerScope = $rootScope.$new();
    playerScope.timecodes = [
      {
        timecode : 20,
        image : {
          large : "largeFilePath"
        }
      }
    ];

    playerScope.timecodesByTime = {
      20 : {
        image : {
          large : "largeFilePath"
        }
      }
    };
    
    indexScope = playerScope.$new();
  });

  it("Should set image preview to the first one at initialization time", function(){
    
    ovIndexLink(indexScope, null, null, null);
    assert.equal(indexScope.imagePreview, "largeFilePath");
  });
  
  it("Should be able to change the image preview", function(){
    ovIndexLink(indexScope, null, null, null);
    indexScope.setImagePreview(20);
    assert.equal(indexScope.imagePreview, "largeFilePath");
  });

  it("Should be able to ask player to seek to the given time", function(done){
    playerScope.duration = 10000;
    
    var playerController = {
      setTime : function(time){
        assert.equal(time, 50);
      }
    };
    var tabController = {
      selectTabs : function(target){
        assert.equal(target, "media");
        done();
      }
    };
    
    var controllers = [playerController, tabController];
    
    ovIndexLink(indexScope, null, null, controllers);
    indexScope.goToTimecode(50);
  });  
  
});