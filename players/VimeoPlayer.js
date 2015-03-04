(function(angular, app){

  "use strict"

  /**
   * Creates a Vimeo player which observes OvPlayerInterface interface.
   * More information on Vimeo player can be found
   * at https://developer.vimeo.com/player.
   * The Vimeo embeded player exposes a JavaSript API to interact with
   * (https://developer.vimeo.com/player/js-api).
   */
  app.factory("OvVimeoPlayer", OvVimeoPlayer);
  OvVimeoPlayer.$inject = ["OvPlayerInterface", "$window", "$document"];
  
  function OvVimeoPlayer(OvPlayerInterface, $window, $document){
    
    /**
     * Creates a new VimeoPlayer.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param String playerId A unique id for the player, useful 
     * if several players are available in the same page
     * @param String videoId The vimeo id of the video
     */
    function VimeoPlayer(jPlayerElement, playerId, videoId){
      OvPlayerInterface.prototype.init.call(this, jPlayerElement, playerId, videoId);
    }

    VimeoPlayer.prototype = new OvPlayerInterface();
    VimeoPlayer.prototype.constructor = VimeoPlayer;

    /**
     * Gets player url.
     * @return String The player url
     */
    VimeoPlayer.prototype.getPlayerUrl = function(){
      return "//player.vimeo.com/video/" + this.videoId + "?api=1&player_id=" + this.playerId;
    };

    /**
     * Intitializes the player.
     * Vimeo player uses postMessage API to be able to communicate with 
     * the player. 
     * Before doing anything on the Vimeo player the ready event
     * must be handled.
     */
    VimeoPlayer.prototype.initialize = function(){
      this.loaded = false;

      // Handle post messages
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      angular.element($window).on("message", this.handlePlayerEventsFn);
    };

    /**
     * Plays or pauses the video depending on video actual state.
     */
    VimeoPlayer.prototype.playPause = function(){
      postActionToPlayer.call(this, this.playing ? "pause" : "play");
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    VimeoPlayer.prototype.setVolume = function(volume){
      postActionToPlayer.call(this, "setVolume", volume / 100);
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    VimeoPlayer.prototype.setTime = function(time){
      time = parseInt(time) || 0.1;
      postActionToPlayer.call(this, "seekTo", time / 1000);
    };
    
    /**
     * Gets video id.
     * @return String The video id
     */
    VimeoPlayer.prototype.getVideoId = function(){
      return this.videoId;
    };
    
    /**
     * Gets player type.
     * @return String A string representation of the player type
     */
    VimeoPlayer.prototype.getPlayerType = function(){
      return "vimeo";
    };
    
    /**
     * Destroys the player.
     * Remove all events listeners.
     */
    VimeoPlayer.prototype.destroy = function(){
      angular.element($window).off("message", this.handlePlayerEventsFn);
      this.loaded = false;
      this.playing = 0;
      this.player = null;
    };

    /**
     * Handles all player post messages.
     * @param MessageEvent/Event event The post message
     * @param Object data If post messages are not implemented, a simple
     * event can by used with data as second parameter instead of data
     * inside the MessageEvent object (event.data)
     */
    function handlePlayerEvents(event, data){
      var data = event.data ? JSON.parse(event.data) : data;

      // Do not handle other player events
      if(data.player_id === this.playerId){

        // Events
        switch(data.event){
          case "ready":
            handleReady.call(this);
            postActionToPlayer.call(this, "getDuration");
          break;
          case "loadProgress":
            this.jPlayerElement.triggerHandler("loadProgress", data.data.percent * 100);
          break;
          case "playProgress":
            this.jPlayerElement.triggerHandler("playProgress", { "time" : data.data.seconds * 1000, "percent" : data.data.percent * 100 });
          break;
          case "play":
            this.playing = 1;
            this.jPlayerElement.triggerHandler("play");
          break;      
          case "pause":
            this.playing = 0;
            this.jPlayerElement.triggerHandler("pause");
          break;
          case "finish":
            this.playing = 0;
            this.jPlayerElement.triggerHandler("end");
          break;
        }

        // Actions
        switch(data.method){
          case "getDuration":
            this.duration = data.value * 1000;
            this.jPlayerElement.triggerHandler("ready", this.duration);
          break;
        }
      }
      
    };

    /**
     * Handles ready event to fully initialize the player.
     * Register event listeners to the player and retrieve the vimeo 
     * iframe corresponding to the player.
     */
    function handleReady(){
      this.postMessageTargetOrigin = $window.location.protocol + this.getPlayerUrl().split("?")[0];
      this.player = $document[0].getElementById(this.playerId);
      this.loaded = true;
      this.playing = 0;
      
      // Register event listeners
      postActionToPlayer.call(this, "addEventListener", "loadProgress");
      postActionToPlayer.call(this, "addEventListener", "playProgress");
      postActionToPlayer.call(this, "addEventListener", "play");
      postActionToPlayer.call(this, "addEventListener", "pause");
      postActionToPlayer.call(this, "addEventListener", "finish");
    }

    /**
     * Sends a post message to the player with the action and the value.
     * @param String action The action to perform (see 
     * https://developer.vimeo.com/player/js-api)
     * @param String The value associated to the action
     */
    function postActionToPlayer(action, value){
      if(this.loaded){
        var data = {
          method: action
        };
        
        if(value) data.value = value;
        return this.player.contentWindow.postMessage(data, this.postMessageTargetOrigin);
      }
      
      return null;
    }

    return VimeoPlayer;
  }
  
})(angular, angular.module("ov.player"));