"use strict"

window.assert = chai.assert;

// PlayerDirective.js
describe("PlayerDirective", function(){
  var $compile, $rootScope, $injector, $sce, scope;
  
  // Load modules player and templates (to mock templates)
  beforeEach(function(){
    module("ov.player")
    module("templates")
  });

  // Dependencies injections
  beforeEach(inject(function(_$compile_, _$rootScope_, _$injector_, _$sce_){
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $injector = _$injector_;
    $sce = _$sce_;
  }));

  // Initializes tests
  beforeEach(function(){
    scope = $rootScope.$new();
  });

  it("Should define attributes ov-fullscreen-icon, ov-time, ov-volume-icon, ov-mode-icon, ov-fullscreen, ov-data, ov-player-type", function(){
    $rootScope.fullViewport = false;
    $rootScope.displayTime = true;
    $rootScope.displayVolumeIcon = true;
    $rootScope.displayModeIcon = true;
    $rootScope.playerType = "vimeo";
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {
        10 : {
           image : {
              small : "",
              large : "" 
           }
        }
      }
    };
    
    var element = angular.element("<ov-player ov-fullscreen-icon=\"true\" ov-full-viewport=\"fullViewport\" ov-time=\"displayTime\" ov-volume-icon=\"displayVolumeIcon\" ov-mode-icon=\"displayModeIcon\" ov-data=\"data\" ov-player-type=\"playerType\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var isolateScope = element.isolateScope();
    assert.isDefined(isolateScope.data.timecodes);
    assert.isObject(isolateScope.data.timecodes);
    assert.isDefined(isolateScope.ovFullscreenIcon);
    assert.isDefined(isolateScope.ovVolumeIcon);
    assert.isDefined(isolateScope.ovModeIcon);
    assert.isDefined(isolateScope.ovTime);
    assert.isDefined(isolateScope.ovFullViewport);
    assert.isDefined(isolateScope.ovPlayerType);
  });

  it("Should display all icons and time if not specified", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {
        10 : {
           image : {
              small : "",
              large : ""
           }
        }
      }
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    var isolateScope = element.isolateScope();
    assert.ok(isolateScope.ovFullscreenIcon);
    assert.ok(isolateScope.ovTime);
    assert.ok(isolateScope.ovModeIcon);
  });
  
  it("Should not display modes icon if no timecodes", function(){
    $rootScope.data = {};    
    $rootScope.displayModeIcon = true;
    var element = angular.element("<ov-player ov-mode-icon=\"displayModeIcon\" ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var isolateScope = element.isolateScope();
    assert.notOk(isolateScope.displayModeButton);
  });
  
  it("Should not display index tab if no timecodes", function(){
    $rootScope.data = {};    
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var isolateScope = element.isolateScope();
    assert.notOk(isolateScope.displayIndexTab);
  });
  
  it("Should propose the video display mode if no timecodes", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var isolateScope = element.isolateScope();
    assert.isArray(isolateScope.modes);
    assert.equal(isolateScope.modes.length, 1);
    assert.equal(isolateScope.modes.length, 1);
    assert.equal(isolateScope.modes[0], "video");
    assert.equal(isolateScope.selectedMode, "video");
  });
  
  it("Should create a Vimeo player if player type is vimeo", function(){
    $rootScope.data = {videoId : "1", type : "vimeo"};
    $rootScope.playerType = "vimeo";
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var controller = element.controller("ovPlayer");
    var isolateScope = element.isolateScope();
    var OvVimeoPlayer = $injector.get("OvVimeoPlayer");
    assert.isNotNull(controller.player);
    assert.ok(controller.player instanceof OvVimeoPlayer);
  });  
  
  it("Should create an HTML player if player type is html", function(){
    $rootScope.data = {videoId : "1", type : "vimeo", files: [{}]};
    $rootScope.playerType = "html";
    var element = angular.element("<ov-player ov-data=\"data\" ov-player-type=\"playerType\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var controller = element.controller("ovPlayer");
    var isolateScope = element.isolateScope();
    var OvHTMLPlayer = $injector.get("OvHTMLPlayer");
    assert.isNotNull(controller.player);
    assert.ok(controller.player instanceof OvHTMLPlayer);
  });

  it("Should not create a player if no video type", function(){
    $rootScope.data = {videoId : "1"};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var controller = element.controller("ovPlayer");
    assert.isNull(controller.player);
  });
  
  it("Should not create a player if no video id", function(){
    $rootScope.data = {type : "vimeo"};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var controller = element.controller("ovPlayer");
    assert.isNull(controller.player);
  });

  it("Should set time preview image and default presentation image", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {
        10 : {
           image : {
              small : "small",
              large : "large" 
           }
        }
      }      
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var isolateScope = element.isolateScope();
    assert.equal(isolateScope.timePreview, "large");
    assert.equal(isolateScope.presentation, "large");
  });

  it("Should be able to open/close the list of display modes", function(){
    $rootScope.data = {};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();
    
    var isolateScope = element.isolateScope();
    isolateScope.toggleModes();
    assert.ok(isolateScope.modesOpened);
  }); 

  it("Should be able to open/close the volume", function(){
    $rootScope.data = {};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.toggleVolume();
    assert.ok(isolateScope.volumeOpened);
  });

  it("Should be able to select a mode", function(){
    $rootScope.data = {};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.selectMode("both-presentation");
    assert.equal(isolateScope.selectedMode, "both-presentation");
  });  

  it("Should be able to play/pause the player", function(done){
    $rootScope.data = {};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    var controller = element.controller("ovPlayer");
    
    controller.player = {
      playPause : function(){
        done();
      }
    };
    
    isolateScope.playPause();
  });
  
  it("Should handle player ready event and set the volume of the video to 100%", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("ready");
    assert.equal(isolateScope.volume, 100);
  });

  it("Should handle player waiting event and set player as \"loading\"", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("waiting");
    assert.ok(isolateScope.loading);
  });

  it("Should handle player playing event and set player as \"not loading\"", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.loading = true;
    element.triggerHandler("playing");
    assert.notOk(isolateScope.loading);
  });

  it("Should handle player durationChange event and set media duration", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("durationChange", 50000);
    assert.equal(isolateScope.duration, 50000);
  });  
  
  it("Should handle player play event and set play/pause button to pause", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("play");
    assert.equal(isolateScope.playPauseButton, "pause");
  });
  
  it("Should handle player pause event and set play/pause button to play", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("pause");
    assert.equal(isolateScope.playPauseButton, "play");
  });
  
  it("Should handle player loadProgress event and set loading percentage", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("loadProgress", {"loadedStart" : 2, "loadedPercent" : 98});
    assert.equal(isolateScope.loadedStart, 2);
    assert.equal(isolateScope.loadedPercent, 98);
  });
  
  it("Should handle player playProgress event and update time, seen percent of the video and find corresponding the presentation image", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {
        10 : {
           image : {
              small : "small",
              large : "large"
           }
        },
        5000 : {
           image : {
              small : "small1",
              large : "large2"
           }
        },
        10000 : {
           image : {
              small : "small3",
              large : "large3"
           }
        }        
      }    
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    element.triggerHandler("playProgress", {time : 7000, percent : 75});
    assert.equal(isolateScope.time, 7000);
    assert.equal(isolateScope.seenPercent, 75);
    assert.equal(isolateScope.presentation, "large2");
  });
  
  it("Should handle player end event and reset time", function(){
    $rootScope.data = {
      type : "vimeo",
      videoId : "1",
      timecodes : {}
    };
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var isolateScope = element.isolateScope();
    isolateScope.time = 5000;
    isolateScope.seenPercent = 50;
    element.triggerHandler("end");
    assert.equal(isolateScope.time, 0);
    assert.equal(isolateScope.seenPercent, 0);
  });
  
  it("Should expose an API with toggleModes, toggleVolume, toggleFullscreen, selectMode", function(){
    $rootScope.data = {};
    var element = angular.element("<ov-player ov-data=\"data\"></ov-player>");
    element = $compile(element)(scope);
    scope.$digest();

    var controller = element.controller("ovPlayer");
    assert.isDefined(controller.toggleModes);
    assert.isDefined(controller.toggleVolume);
    assert.isDefined(controller.toggleFullscreen);
    assert.isDefined(controller.selectMode);
  });   
  
});