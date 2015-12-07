'use strict';

(function(app) {

  /**
   * Defines a service describing a player.
   * All players must implements the methods of this object.
   * All events are dispatched to the given jPlayerElement.
   * The following events are emitted by the player :
   *  - "play" : Player starts playing
   *  - "pause" : Player pauses
   *  - "loadProgress" : Player is buffering
   *  - "playProgress" : Player is playing
   *  - "ready" : Player is ready to play the media
   *  - "durationChange" : Media duration has changed
   *  - "end" : Media has reached the end
   *  - "waiting" : Media is waiting for buffering
   *  - "playing" : Media is ready to play after buffering
   *
   * e.g.
   *
   * // Get an instance of the OvVimeoPlayer
   * // (which extends OvPlayer)
   * var OvVimeoPlayer = $injector.get("OvVimeoPlayer");
   * var player = new OvVimeoPlayer(element, "player_id", "118786909");
   *
   * // Listen to "ready" event
   * element.on("ready", function(event){
   *   console.log("Player is ready");
   * });
   *
   * // Listen to "waiting" event
   * element.on("waiting", function(event){
   *   console.log("Player is buffering");
   * });
   *
   * // Listen to "playing" event
   * element.on("playing", function(event){
   *   console.log("Player has stopped buffering and can play");
   * });
   *
   * // Listen to "durationChange" event
   * element.on("durationChange", function(event, duration){
   *   console.log("Media duration " + duration);
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
   * element.on("loadProgress", function(event, data){
   *   console.log("Loading started at" + data.loadedStart + " percents of the media");
   *   console.log(data.loadedPercent + " percents of the media loaded");
   * });
   *
   * // Listen to "playProgress" event
   * element.on("playProgress", function(event, data){
   *   console.log("Actual time " + data.time);
   *   console.log(data.percent + " percents of the media played");
   * });
   *
   * // Listen to "end" event
   * element.on("end", function(event){
   *   console.log("Media has reached the end");
   * });
   */
  function OvPlayer() {

    /**
     * Defines a Player interface which every Player must implement.
     */
    function Player() {}

    /**
     * Checks if data object is valid.
     * @param Object jPlayerElement The JQLite HTML element corresponding
     * to the HTML element which will receive events dispatched by
     * the player
     * @param Object media Details of the Media
     *   {
     *     mediaId : "136081112", // The id of the media
     *     timecodes : [ // Timecodes
     *       {
     *         timecode : 0, // Timecode in milliseconds (0 ms)
     *         image : { // Image to display at 0 ms
     *           small : "slide_00000.jpeg", // Small version of the image
     *           large : "slide_00000_large.jpeg" // Large version of the image
     *         }
     *       },
     *       {
     *         timecode : 1200, // Timecode in milliseconds (1200 ms)
     *         image : { // Image to display at 1200 ms
     *           small : "slide_00001.jpeg", // Small version of the image
     *           large : "slide_00001_large.jpeg" // Large version of the image
     *         }
     *       }
     *       ...
     *     ]
     *   }
     */
    Player.prototype.init = function(jPlayerElement, media) {
      if (!jPlayerElement || !media)
        throw new Error('A player JQLite Element and a media object are expected as Player arguments');

      this.jPlayerElement = jPlayerElement;
      this.media = media;
      this.playerId = 'player_' + this.media.mediaId;
    };

    /**
     * Gets media id.
     * @return String The media id
     */
    Player.prototype.getMediaId = function() {
      return this.media.mediaId;
    };

    /**
     * Gets player id.
     * @return String The player id
     */
    Player.prototype.getId = function() {
      return this.playerId;
    };

    /**
     * Gets media url.
     * @return String The media url
     */
    Player.prototype.getMediaUrl = function(definition) {
      throw new Error('getMediaUrl method not implemented for this player');
    };

    /**
     * Gets media definitions.
     * @return Array The list of definitions
     */
    Player.prototype.getAvailableDefinitions = function() {
      throw new Error('getAvailableDefinitions method not implemented for this player');
    };

    /**
     * Gets media thumbnail.
     * @return String The media thumbnail
     */
    Player.prototype.getMediaThumbnail = function() {
      throw new Error('getMediaThumbnail method not implemented for this player');
    };

    /**
     * Inititializes the player after DOM is loaded.
     */
    Player.prototype.initialize = function() {
      throw new Error('initialize method not implemented for this player');
    };

    /**
     * Loads current media.
     */
    Player.prototype.load = function() {
      throw new Error('load method not implemented for this player');
    };

    /**
     * Tests if player actual state is pause.
     * @param Boolean true if paused, false otherwise
     */
    Player.prototype.isPaused = function() {
      throw new Error('isPaused method not implemented for this player');
    };

    /**
     * Plays or pauses the media depending on media actual state.
     */
    Player.prototype.playPause = function() {
      throw new Error('play method not implemented for this player');
    };

    /**
     * Sets volume.
     * @param Number volume The new volume from 0 to 100.
     */
    Player.prototype.setVolume = function() {
      throw new Error('setVolume method not implemented for this player');
    };

    /**
     * Sets time.
     * @param Number time The time to seek to in milliseconds
     */
    Player.prototype.setTime = function() {
      throw new Error('setTime method not implemented for this player');
    };

    /**
     * Gets player type.
     * @return String A string representation of the player type
     */
    Player.prototype.getPlayerType = function() {
      throw new Error('getPlayerType method not implemented for this player');
    };

    /**
     * Destroys the player.
     */
    Player.prototype.destroy = function() {
      throw new Error('destroy method not implemented for this player');
    };

    return Player;
  }

  app.factory('OvPlayer', OvPlayer);

})(angular.module('ov.player'));
