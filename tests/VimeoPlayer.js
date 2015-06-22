"use strict"

window.assert = chai.assert;

// VimeoPlayer.js
describe("VimeoPlayer", function(){
  var player, playerElement, $document, $injector, jWindowElement,$window;
  
  // Load module player
  beforeEach(module("ov.player"));
  
  // Dependencies injections
  beforeEach(inject(function(_$injector_, _$document_, _$window_){
    $window = _$window_;
    $injector = _$injector_;
    $document = _$document_;
  }));

  // Initializes tests
  beforeEach(function(){
    jWindowElement = angular.element($window);
    playerElement = $document[0].createElement("div");
    playerElement.setAttribute("id", "player_1");
    $document[0].body.appendChild(playerElement);
    
    playerElement.contentWindow = { postMessage : function(data){}};
    
    var OvVimeoPlayer = $injector.get("OvVimeoPlayer"); 
    player = new OvVimeoPlayer(angular.element(playerElement), "player_1", "5");
    player.initialize();
  });
  
  // Destroy player after each test
  afterEach(function(){
    $document[0].body.removeChild(playerElement);
    playerElement = null;
    player.destroy();
  });

  it("Should be able to build Vimeo player url", function(){ 
    assert.equal(player.getPlayerUrl(), "//player.vimeo.com/video/5?api=1&player_id=player_1");
  });
  
  it("Should register to Vimeo player events", function(done){
    var events = [];
    
    // Simulate Vimeo player
    playerElement.contentWindow.postMessage = function(data){
      events.push(data.value);
      if(events.length === 6)
        done();
    };

    jWindowElement.triggerHandler("message", {event : "ready", player_id : "player_1"});
  });
  
  it("Should be able to play the video", function(done){
    player.playing = 0;
    
    angular.element(playerElement).on("play", function(){
      done(); 
    });
    
    // Simulate Vimeo player
    playerElement.contentWindow.postMessage = function(data){
      data = JSON.parse(data);
      if(data.value === "play")
        jWindowElement.triggerHandler("message", {event : "play", player_id : "player_1"});
    };

    jWindowElement.triggerHandler("message", {event : "ready", player_id : "player_1"});
    player.playPause();
  });
  
  it("Should be able to pause the video", function(done){
    player.playing = 1;
    
    angular.element(playerElement).on("pause", function(){
      done(); 
    });
    
    // Simulate Vimeo player
    playerElement.contentWindow.postMessage = function(data){
      data = JSON.parse(data);
      if(data.value === "pause"){
        jWindowElement.triggerHandler("message", {event : "pause", player_id : "player_1"});
      }
    };

    jWindowElement.triggerHandler("message", {event : "ready", player_id : "player_1"});
    player.playPause();
  });
  
  it("Should be able to change video volume", function(done){

    // Simulate Vimeo player
    playerElement.contentWindow.postMessage = function(data){
      data = JSON.parse(data);
      if(data.method === "setVolume"){
        assert.equal(data.value, 0.5);
        done();
      }
    };

    jWindowElement.triggerHandler("message", {event : "ready", player_id : "player_1"});
    player.setVolume(50);
  });
  
  it("Should be able to seek to video specific time", function(done){

    // Simulate Vimeo player
    playerElement.contentWindow.postMessage = function(data){
      data = JSON.parse(data);
      if(data.method === "seekTo"){
        assert.equal(data.value, 50);
        done();
      }
    };

    jWindowElement.triggerHandler("message", {event : "ready", player_id : "player_1"});
    player.setTime(50000);
  });
  
});