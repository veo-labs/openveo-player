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
     * @param {String} id The player id to use as the "id" attribute
     */
    Player.prototype.init = function(jPlayerElement, id) {
      if (!jPlayerElement)
        throw new Error('A player JQLite Element is expected as Player argument');

      this.jPlayerElement = jPlayerElement;
      this.selectedSourceIndex = 0;
      this.playerId = id;
    };

    /**
     * Sets the source.
     *
     * @method setMediaSource
     * @param {Number} index of the source in the list of media sources
     */
    Player.prototype.setMediaSource = function(index) {
      this.selectedSourceIndex = index;
    };

    /**
     * Gets index of the selected media source.
     *
     * @method getSourceIndex
     * @return {Number} index of the selected media source in the list of sources
     */
    Player.prototype.getSourceIndex = function() {
      return this.selectedSourceIndex;
    };

    /**
     * Gets media ids.
     *
     * @method getMediaIds
     * @return {Array} The list of media ids
     */
    Player.prototype.getMediaIds = function() {
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
     * Sets current media.
     *
     * @method setMedia
     * @param {Objet} media New media
     */
    Player.prototype.setMedia = function(media) {
      if (!media)
        throw new Error('Player needs a valid media');

      this.media = media;
    };

    /**
     * Gets the url of the selected source.
     *
     * @method getSourceUrl
     * @return {String|Null} The url of the source
     */
    Player.prototype.getSourceUrl = function() {
      return null;
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
     * Tests if player actual state is playing.
     *
     * @method isPlaying
     * @return {Boolean} true if playing, false otherwise
     */
    Player.prototype.isPlaying = function() {
      throw new Error('isPlaying method not implemented for this player');
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

    /**
     * Changes definition of the current source.
     *
     * @method setDefinition
     * @param {Object} definition Definition from the list of available definitions
     */
    Player.prototype.setDefinition = function(definition) {
      throw new Error('setDefinition method not implemented for this player');
    };

    return Player;
  }

  app.factory('OvPlayer', OvPlayer);

})(angular.module('ov.player'));
