(function(angular, app){

  "use strict"

  /**
   * Creates a Flow player which observes OvPlayer interface.
   * More information on the flow player
   * at https://flowplayer.org/docs/api.html.
   */
  app.factory("OvFlowPlayer", OvFlowPlayer);
  OvFlowPlayer.$inject = ["OvPlayer", "$window", "$document", "$timeout"];
  
  function OvFlowPlayer(OvPlayer, $window, $document, $timeout){
    
    // All HTML player events
    var events = [
      "finish",
      "pause",
      "progress",
      "ready",
      "resume"
    ];
    
    /**
     * Creates a new FlowPlayer.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param Object media Details about the media
     *   {
     *     mediaId : "136081112", // The id of the media
     *     files : [ // The list of media files (required for "html" player)
     *       {
     *         width : 640, // Media width for this file
     *         height : 360, // Media height for this file
     *         link : "https://player.vimeo.com/external/136081112.sd.mp4" // Media url
     *       },
     *       {
     *         width : 1280, // Media width for this file
     *         height : 720, // Media height for this file
     *         link : "https://player.vimeo.com/external/136081112.hd.mp4" // Media url
     *       },
     *       ...
     *     ],
     *     pictures : [ // The list of media thumbnails (required for "html" player)
     *       {
     *         width : 960,
     *         height : 540,
     *         link : "https://i.vimeocdn.com/video/530445364_960x540.jpg"
     *       },
     *       {
     *         width : 1280,
     *         height : 720,
     *         link : "https://i.vimeocdn.com/video/530445364_1280x720.jpg"
     *       }
     *     ]
     *   }
     */
    function FlowPlayer(jPlayerElement, media){
      OvPlayer.prototype.init.call(this, jPlayerElement, media);
      
      if(typeof ovFlashPlayer === "undefined" || typeof ovFlashPlayer !== "string")
        throw new Error("ovFlashPlayer global variable must be defined and set to the flowplayer.swf file");
    }

    FlowPlayer.prototype = new OvPlayer();
    FlowPlayer.prototype.constructor = FlowPlayer;

    /**
     * Gets media url.
     * Get the lowest media quality.
     *
     * @return String The media url
     */
    FlowPlayer.prototype.getMediaUrl = function(){
      return this.media.files[0].link;
    };
    
    /**
     * Gets media thumbnail.
     * Get the higher thumbnail quality.
     *
     * @return String The media thumbnail url
     */
    FlowPlayer.prototype.getMediaThumbnail = function(){
      return this.media.pictures && this.media.pictures.length && this.media.pictures[this.media.pictures.length - 1].link;
    };

    /**
     * Inititializes the player when DOM is loaded.
     *
     * Retrieves player container HTML element and install flowplayer into it.
     * Then bind listeners to it.
     */
    FlowPlayer.prototype.initialize = function(){
      this.loaded = false;
      this.jPlayerElement.triggerHandler("waiting");
      var playerContainer = $document[0].getElementById(this.playerId);
      
      // Install flowplayer into selected container
      this.player = flowplayer(playerContainer, {
        swf : ovFlashPlayer,
        clip : { 
          sources : [
            {
              type : "video/mp4",
              src : this.getMediaUrl()
            }          
          ]
        }
      });
      
      // Handle events
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      
      // Set media events listeners
      for(var i = 0 ; i < events.length ; i++)
        this.player.on(events[i], this.handlePlayerEventsFn);
    };

    /**
     * Plays or pauses the media depending on media actual state.
     */
    FlowPlayer.prototype.playPause = function(){
      if(this.playing)
        this.player.pause();
      else
        this.player.resume();
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    FlowPlayer.prototype.setVolume = function(volume){
      this.player.volume(volume / 100);
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    FlowPlayer.prototype.setTime = function(time){
      var self = this;
      time = parseInt(time) || 0.1;

      this.player.pause();
      
      // Avoid digestion phase by executing treatment on the next loop
      $timeout(function(){
        self.jPlayerElement.triggerHandler("waiting");
        self.player.seek(time / 1000, function(){
          self.player.resume();
        });
      }, 1);
    };
    
    /**
     * Gets player type.
     * @return String "flowplayer"
     */
    FlowPlayer.prototype.getPlayerType = function(){
      return "flowplayer";
    };
    
    /**
     * Destroys the player.
     * Remove all events listeners.
     */
    FlowPlayer.prototype.destroy = function(){
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);
      
      for(var i = 0 ; i < events.length ; i++)
        jPlayer.off(events[i], this.handlePlayerEventsFn);
      
      this.loaded = false;
      this.playing = 0;
      this.player = null;
    };

    /**
     * Handles all player media events.
     * @param Event event The received event
     */
    function handlePlayerEvents(event){

      // Events
      switch(event.type){
          
        // Ready to render the media data at the current playback position
        // for the first time
        case "ready":
          var duration = this.player.video.duration || this.media.metadata && this.media.metadata.duration;
          this.loaded = true;
          this.playing = 0;
          this.jPlayerElement.triggerHandler("durationChange", duration * 1000);          
          this.jPlayerElement.triggerHandler("ready");
        break;
        
        // Media is no longer paused
        case "resume":
        case "play":
          this.playing = 1;
          this.jPlayerElement.triggerHandler("play");
        break;
          
        // Media has been paused
        case "pause":
          this.playing = 0;
          this.jPlayerElement.triggerHandler("pause");
        break;    
        
        // Media playback has reached the end
        case "finish":
          this.playing = 0;
          this.jPlayerElement.triggerHandler("end");
        break;
          
        // Media playback position has changed
        case "progress":

          // No indication about the playback position of the loading
          // percentage, assume it to be 0
          this.jPlayerElement.triggerHandler("loadProgress", {"loadedStart" : 0, "loadedPercent" : (this.player.video.buffer / this.player.video.duration) * 100});
          var playedPercent = (this.player.video.time / this.player.video.duration) * 100;
          this.jPlayerElement.triggerHandler("playProgress", { "time" : this.player.video.time * 1000, "percent" : playedPercent });
          
        break;
      }
    };

    return FlowPlayer;
  }
  
})(angular, angular.module("ov.player"));