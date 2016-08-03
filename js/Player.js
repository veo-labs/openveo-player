'use strict';

(function(app) {

  /**
   * Defines a factory describing a player.
   *
   * All players must implement the methods of this object.
   * All events are dispatched to the given jPlayerElement.
   * The following events are emitted by the player :
   *  - "ovPlay" : Player starts playing
   *  - "ovPause" : Player pauses
   *  - "ovLoadProgress" : Player is buffering
   *  - "ovPlayProgress" : Player is playing
   *  - "ivReady" : Player is ready to play the media
   *  - "ovDurationChange" : Media duration has changed
   *  - "ovEnd" : Media has reached the end
   *  - "ovWaiting" : Media is waiting for buffering
   *  - "ovPlaying" : Media is ready to play after buffering
   *  - "ovError" : Player as encountered an error
   *
   * e.g.
   *
   * // Get an instance of the OvVimeoPlayer
   * // (which extends OvPlayer)
   * var OvVimeoPlayer = $injector.get('OvVimeoPlayer');
   * var player = new OvVimeoPlayer(element, 'player_id', '118786909');
   *
   * @module ov.player
   * @class OvPlayer
   */
  function OvPlayer() {

    /**
     * Defines a Player interface which every Player must implement.
     */
    function Player() {}

    /**
     * Checks if data object is valid.
     *
     * @method init
     * @param {Object} jPlayerElement The JQLite HTML element corresponding
     * to the HTML element which will receive events dispatched by
     * the player
     * @param {Object} media Details of the Media
     *   {
     *     mediaId : ["136081112", "136081113"], // The array ids of the media sources
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
    Player.prototype.init = function(jPlayerElement, media, selectedMediaIndex) {
      if (!jPlayerElement || !media)
        throw new Error('A player JQLite Element and a media object are expected as Player arguments');

      this.jPlayerElement = jPlayerElement;
      this.media = media;
      this.selectedMediaIndex = selectedMediaIndex || 0;
      this.playerId = 'player_' + this.media.mediaId[this.selectedMediaIndex];
    };

    /**
     * Set index of selected media
     *
     * @method setSelectedMediaIndex
     * @param {Number} index of selected media in media Array
     */
    Player.prototype.setSelectedMediaIndex = function(index) {
      this.selectedMediaIndex = index;
    };

    /**
     * Get index of selected media
     *
     * @method getSelectedMediaIndex
     * @return {Number} index of selected media in media Array
     */
    Player.prototype.getSelectedMediaIndex = function() {
      return this.selectedMediaIndex;
    };

    /**
     * Gets media id.
     *
     * @method getMediaId
     * @return {String} The media id
     */
    Player.prototype.getMediaId = function() {
      return this.media.mediaId;
    };

    /**
     * Gets player id.
     *
     * @method getId
     * @return {String} The player id
     */
    Player.prototype.getId = function() {
      return this.playerId;
    };

    /**
     * Gets media url.
     *
     * @method getMediaSources
     * @param {Object} definition Media definition object
     * @return {String} The media sources
     */
    Player.prototype.getMediaSources = function(definition) {
      throw new Error('getMediaUrl method not implemented for this player');
    };

    /**
     * Gets media MIME Type.
     *
     * @method getMediaUrl
     * @param {Object} definition Media definition object
     * @return {String} The media url
     */
    Player.prototype.getMediaMIME = function(definition) {
      return definition && definition.mimeType ? definition.mimeType : 'video/mp4';
    };

    /**
     * Gets media definitions.
     *
     * @method getAvailableDefinitions
     * @return {Array} The list of definitions
     */
    Player.prototype.getAvailableDefinitions = function() {
      throw new Error('getAvailableDefinitions method not implemented for this player');
    };

    /**
     * Gets media thumbnail.
     *
     * @method getMediaThumbnail
     * @return {String} The media thumbnail
     */
    Player.prototype.getMediaThumbnail = function() {
      throw new Error('getMediaThumbnail method not implemented for this player');
    };

    /**
     * Inititializes the player after DOM is loaded.
     *
     * @method initialize
     */
    Player.prototype.initialize = function() {
      throw new Error('initialize method not implemented for this player');
    };

    /**
     * Loads current media.
     *
     * @method load
     */
    Player.prototype.load = function() {
      throw new Error('load method not implemented for this player');
    };

    /**
     * Tests if player actual state is pause.
     *
     * @method isPaused
     * @param {Boolean} true if paused, false otherwise
     */
    Player.prototype.isPaused = function() {
      throw new Error('isPaused method not implemented for this player');
    };

    /**
     * Plays or pauses the media depending on media actual state.
     *
     * @method playPause
     */
    Player.prototype.playPause = function() {
      throw new Error('play method not implemented for this player');
    };

    /**
     * Sets volume.
     *
     * @method setVolume
     * @param {Number} volume The new volume from 0 to 100.
     */
    Player.prototype.setVolume = function() {
      throw new Error('setVolume method not implemented for this player');
    };

    /**
     * Sets time.
     *
     * @method setTime
     * @param {Number} time The time to seek to in milliseconds
     */
    Player.prototype.setTime = function() {
      throw new Error('setTime method not implemented for this player');
    };

    /**
     * Gets player type.
     *
     * @method getPlayerTYpe
     * @return {String} A string representation of the player type
     */
    Player.prototype.getPlayerType = function() {
      throw new Error('getPlayerType method not implemented for this player');
    };

    /**
     * Destroys the player.
     *
     * @method destroy
     */
    Player.prototype.destroy = function() {
      throw new Error('destroy method not implemented for this player');
    };

    return Player;
  }

  app.factory('OvPlayer', OvPlayer);

})(angular.module('ov.player'));
