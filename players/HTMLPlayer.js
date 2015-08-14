(function(angular, app){

  "use strict"

  /**
   * Creates an HTML player which observes OvPlayerInterface interface.
   * More information on HTML player
   * at http://www.w3.org/TR/html5/embedded-content-0.html#the-video-element.
   */
  app.factory("OvHTMLPlayer", OvHTMLPlayer);
  OvHTMLPlayer.$inject = ["OvPlayerInterface", "$window", "$document"];
  
  function OvHTMLPlayer(OvPlayerInterface, $window, $document){

    // All HTML player events
    var events = [
      "progress",
      "playing",
      "waiting",
      "ended",
      "durationchange",
      "timeupdate",
      "play",
      "pause"
    ];
    
    /**
     * Creates a new HTMLPlayer.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the element which will receive events dispatched by the player
     * @param Object video Details about the video
     *   {
     *     videoId : "136081112", // The id of the video
     *     metadata : {
     *      duration : 20 // Media duration in seconds
     *     },     
     *     timecodes : { // Timecodes
     *       0 : { // Timecode in milliseconds (0 ms)
     *         image : { // Image to display at 0 ms
     *           small : "slide_00000.jpeg", // Small version of the image
     *           large : "slide_00000_large.jpeg" // Large version of the image
     *         }
     *       },
     *       1200 : { // Timecode in milliseconds (1200 ms)
     *         image : { // Image to display at 1200 ms
     *           small : "slide_00001.jpeg", // Small version of the image
     *           large : "slide_00001_large.jpeg" // Large version of the image
     *         }
     *       }
     *       ...
     *     },
     *     files : [ // The list of video files (required for "html" player)
     *       {
     *         width : 640, // Video width for this file
     *         height : 360, // Video height for this file
     *         link : "https://player.vimeo.com/external/136081112.sd.mp4" // Video url
     *       },
     *       {
     *         width : 1280, // Video width for this file
     *         height : 720, // Video height for this file
     *         link : "https://player.vimeo.com/external/136081112.hd.mp4" // Video url
     *       },
     *       ...
     *     ],
     *     pictures : [ // The list of video thumbnails (required for "html" player)
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
    function HTMLPlayer(jPlayerElement, video){
      OvPlayerInterface.prototype.init.call(this, jPlayerElement, video);
    }

    HTMLPlayer.prototype = new OvPlayerInterface();
    HTMLPlayer.prototype.constructor = HTMLPlayer;

    /**
     * Gets video url.
     * Get the lowest video quality.
     *
     * @return String The video url
     */
    HTMLPlayer.prototype.getVideoUrl = function(){
      return this.video.files[0].link;
    };
    
    /**
     * Gets video thumbnail.
     * Get the higher thumbnail quality.
     *
     * @return String The video thumbnail url
     */
    HTMLPlayer.prototype.getVideoThumbnail = function(){
      return this.video.pictures && this.video.pictures.length && this.video.pictures[this.video.pictures.length - 1].link;
    };

    /**
     * Inititializes the player when DOM is loaded.
     *
     * Retrieves player HTML element and attach listeners to it to be able 
     * to receive media events.
     */
    HTMLPlayer.prototype.initialize = function(){
      this.loaded = false;
      this.player = $document[0].getElementById(this.playerId);
      
      // Handle post messages
      this.handlePlayerEventsFn = angular.bind(this, handlePlayerEvents);
      var jPlayer = angular.element(this.player);
      
      // Set media events listeners
      for(var i = 0 ; i < events.length ; i++)
        jPlayer.on(events[i], this.handlePlayerEventsFn);
      
      // Start loading video
      this.player.load();
    };

    /**
     * Plays or pauses the video depending on video actual state.
     */
    HTMLPlayer.prototype.playPause = function(){
      if(this.playing)
        this.player.pause();
      else
        this.player.play();
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    HTMLPlayer.prototype.setVolume = function(volume){
      this.player.volume = volume / 100;
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    HTMLPlayer.prototype.setTime = function(time){
      time = parseInt(time) || 0.1;
      this.player.currentTime = time / 1000;
    };
    
    /**
     * Gets player type.
     * @return String A string representation of the player type
     */
    HTMLPlayer.prototype.getPlayerType = function(){
      return "html";
    };
    
    /**
     * Destroys the player.
     * Remove all events listeners.
     */
    HTMLPlayer.prototype.destroy = function(){
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
          
        // Fetching metadata
        case "progress":
          
          // Got buffering information
          // Caution, the progress event maybe dispatched even if buffer
          // is empty
          if(this.player.buffered.length === 1){
            var loadedStart = (this.player.buffered.start(0) / this.player.duration) * 100;
            var loadedPercent = ((this.player.buffered.end(0) - this.player.buffered.start(0)) / this.player.duration) * 100;

            this.jPlayerElement.triggerHandler("loadProgress", {"loadedStart" : loadedStart, "loadedPercent" : loadedPercent});
          }
          
        break;
          
        // The duration attribute has just been updated
        case "durationchange":
          var duration = this.player.duration || this.video.metadata && this.video.metadata.duration;
          this.jPlayerElement.triggerHandler("durationChange", duration * 1000);
        break;
          
        // Ready to render the media data at the current playback position
        // for the first time
        case "loadeddata":
          this.loaded = true;
          this.playing = 0;
          this.jPlayerElement.triggerHandler("ready");
        break;
        
        // Video is no longer paused
        case "play":
          this.playing = 1;
          this.jPlayerElement.triggerHandler("play");
        break;
          
        // Video has been paused
        case "pause":
          this.playing = 0;
          this.jPlayerElement.triggerHandler("pause");
        break;    
        
        // Video playback has reached the end
        case "ended":
          this.playing = 0;
          this.jPlayerElement.triggerHandler("end");
        break;
          
        // Video playback has stopped because the next frame is not available
        case "waiting":
          this.jPlayerElement.triggerHandler("waiting");
        break;
          
        // Video playback is ready to start after being paused or delayed
        // due to lack of media data
        case "playing":
          this.jPlayerElement.triggerHandler("playing");
        break;
          
        // Video playback position has changed
        case "timeupdate":
          var playedPercent = (this.player.currentTime / this.player.duration) * 100;
          this.jPlayerElement.triggerHandler("playProgress", { "time" : this.player.currentTime * 1000, "percent" : playedPercent });
        break;
      }
    };

    return HTMLPlayer;
  }
  
})(angular, angular.module("ov.player"));