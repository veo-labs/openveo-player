"use strict"

window.assert = chai.assert;

describe("IndexDirective", function(){
  
  beforeEach(module("ov.player"));

  var ovIndexLink, $rootScope;
  
  beforeEach(inject(function(_ovIndexLink_, _$rootScope_){
    $rootScope = _$rootScope_;
    ovIndexLink = _ovIndexLink_;
  }));

  it("Should set image preview to the first one at initialization time", function(){ 

    var playerScope = $rootScope.$new();
    playerScope.data = {
      timecodes : {
        20 : {
          image : {
            large : "largeFilePath" 
          }
        }
      }
    };
    
    var indexScope = playerScope.$new();
    
    ovIndexLink(indexScope, null, null, null);
    assert.equal(indexScope.imagePreview, "largeFilePath");
  });
  
  it("Should be able to change the image preview", function(){ 
    
    var playerScope = $rootScope.$new();
    playerScope.data = {
      timecodes : {
        20 : {
          image : {
            large : "largeFilePath" 
          }
        }
      }
    };
    
    var indexScope = playerScope.$new();
    
    ovIndexLink(indexScope, null, null, null);
    indexScope.setImagePreview(20);
    assert.equal(indexScope.imagePreview, "largeFilePath");
  });  
  
  it("Should be able to ask player to seek to the given time", function(done){
    
    var playerScope = $rootScope.$new();
    playerScope.duration = 10000;
    playerScope.data = {
      timecodes : {
        20 : {
          image : {
            large : "largeFilePath" 
          }
        }
      }
    };
    
    var indexScope = playerScope.$new();
    
    var playerController = {
      player : {
        setTime : function(time){
          assert.equal(time, 50);
          done();
        }
      }
    };
    
    ovIndexLink(indexScope, null, null, playerController);
    indexScope.goToTimecode(50);
  });  
  
});