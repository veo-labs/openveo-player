(function(app){

  "use strict"
  
  /**
   * Defines a service describing the interface for a player. 
   * All players must implements the methods of this interface.
   * All events are dispatched to the given jPlayerElement.
   * The following events are emitted by the player : 
   *  - "play" event
   *  - "pause" event
   *  - "loadProgress" event with the percentage load progress
   *
   * e.g.
   * 
   * // Get an instance of the OvVimeoPlayer
   * // (which extends OvPlayerInterface)
   * var OvVimeoPlayer = $injector.get("OvVimeoPlayer");
   * var player = new OvVimeoPlayer(element, "player_id", "118786909");
   * 
   * // Listen to "ready" event 
   * element.on("ready", function(event, duration){
   *   console.log("Player is ready");
   *   console.log("Video duration " + duration);
   * });
   * 
   * // Listen to "play" event
   * element.on("play", function(event){
   *   console.log("Player is playing");
   * });
   * 
   * // Listen to "pause" event
   * element.on("pause", function(event){
   *   console.log("Player is in pause");
   * });
   * 
   * // Listen to "loadProgress" event
   * element.on("loadProgress", function(event, loadPercent){
   *   console.log(loadPercent + " percents of the video loaded");
   * });
   * 
   * // Listen to "playProgress" event
   * element.on("playProgress", function(event, data){
   *   console.log("Actual time " + data.time);
   *   console.log(data.percent + " percents of the video played");
   * });
   * 
   * // Listen to "end" event
   * element.on("end", function(event){
   *   console.log("Video has finished");
   * }); 
   */
  app.factory("OvPlayerInterface", OvPlayer);
  
  function OvPlayer(){
    
    function Player(){}
    
    /**
     * Checks if data object is valid.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the HTML element which will receive events dispatched by
     * the player
     * @param String playerId A unique id for the player, useful 
     * if several players are available in the same page
     * @param String videoId The vimeo id of the video
     */
    Player.prototype.init = function(jPlayerElement, playerId, videoId){
      if(!jPlayerElement || !playerId || !videoId)
        throw new Error("A player JQLite Element, a player id and a video id are expected as Player arguments");
      
      this.jPlayerElement = jPlayerElement;
      this.playerId = playerId;
      this.videoId = videoId;
    };

    /**
     * Gets player url.
     * @return String The player url
     */
    Player.prototype.getPlayerUrl = function(){throw new Error("getPlayerUrl method not implemented for this player");};

    /**
     * Intitializes the player.
     */
    Player.prototype.initialize = function(){throw new Error("initialize method not implemented for this player");};
    
    /**
     * Plays or pauses the video depending on video actual state.
     */
    Player.prototype.playPause = function(){throw new Error("play method not implemented for this player");};
    
    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    Player.prototype.setVolume = function(volume){throw new Error("setVolume method not implemented for this player");}; 
    
    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    Player.prototype.setTime = function(time){throw new Error("setTime method not implemented for this player");};    
    
    /**
     * Gets video id.
     * @return String The video id
     */
    Player.prototype.getVideoId = function(){throw new Error("getVideoId method not implemented for this player");};    
    
    /**
     * Gets player type.
     * @return String A string representation of the player type
     */
    Player.prototype.getPlayerType = function(){throw new Error("getPlayerType method not implemented for this player");};

    /**
     * Destroys the player.
     */
    Player.prototype.destroy = function(){throw new Error("destroy method not implemented for this player");};     

    return Player;
  }
  
})(angular.module("ov.player"));